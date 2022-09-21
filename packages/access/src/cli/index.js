#!/usr/bin/env node
/* eslint-disable no-console */
import * as Keypair from '@ucanto/authority'
import fs from 'fs'
import ora from 'ora'
import path from 'path'
import sade from 'sade'
import { Transform } from 'stream'
import undici from 'undici'
import * as Access from '../index.js'
import { linkCmd } from './cmd-link.js'
import { getConfig, NAME, pkg } from './config.js'
import { getService } from './utils.js'
import inquirer from 'inquirer'

const prog = sade(NAME)
prog
  .version(pkg.version)
  .option('-p, --profile', 'Select the config profile to use.', 'main')
  .option('--env', 'Env', 'production')

prog
  .command('init')
  .describe('Create or save a keypair to the config.')
  .option('--force', 'Override config with new keypair.', false)
  .option('--private-key', 'Create new keypair with private key.')
  .action(async (opts) => {
    const config = getConfig(opts.profile)
    const spinner = ora('Creating new keypair').start()
    try {
      const privateKey = /** @type {string | undefined} */ (
        config.get('private-key')
      )

      // Save or override keypair
      if (opts['private-key']) {
        const kp = Keypair.parse(opts['private-key'])
        config.set('private-key', opts['private-key'])
        config.set('did', kp.did())
        spinner.succeed(`Keypair created and saved to ${config.path}`)
        return
      }

      // Create or override keypair
      if (opts.force || !privateKey) {
        const kp = await Keypair.SigningAuthority.generate()
        config.set('private-key', Keypair.format(kp))
        config.set('did', kp.did())
        spinner.succeed(`Keypair created and saved to ${config.path}`)
        return
      }

      if (privateKey) {
        spinner.succeed(
          `Your already have a private key in your config, use --force to override.`
        )
        return
      }
    } catch (error) {
      // @ts-ignore
      spinner.fail(error.message)
      console.error(error)
      process.exit(1)
    }
  })

prog
  .command('register')
  .describe("Register with the service using config's keypair.")
  .action(async (opts) => {
    const config = getConfig(opts.profile)
    const { audience, url } = await getService(opts.env)
    const spinner = ora('Registering with the service').start()
    try {
      if (!config.get('private-key')) {
        spinner.fail(
          `You dont have a private key saved yet, run "${NAME} init"`
        )
        process.exit(1)
      }

      const { email } = await inquirer.prompt({
        type: 'input',
        name: 'email',
        message: 'Input your email to validate:',
      })

      // @ts-ignore
      const issuer = Keypair.parse(config.get('private-key'))
      await Access.validate({
        audience,
        url,
        issuer,
        caveats: {
          as: email,
        },
      })

      spinner.text = 'Waiting for email validation...'
      const proof = await Access.pullRegisterDelegation({
        issuer,
        url,
      })

      await Access.register({
        audience,
        url,
        issuer,
        proof,
      })

      spinner.succeed('Registration done.')
    } catch (error) {
      console.error(error)
      // @ts-ignore
      spinner.fail(error.message)
      process.exit(1)
    }
  })

prog
  .command('upload <file>')
  .describe("Register with the service using config's keypair.")
  .action(async (file, opts) => {
    const config = getConfig(opts.profile)
    const { url } = await getService(opts.env)
    const spinner = ora('Registering with the service').start()
    try {
      if (!config.get('private-key')) {
        spinner.fail(
          `You dont have a private key saved yet, run "${NAME} init"`
        )
        process.exit(1)
      }

      const stream = fs.createReadStream(path.resolve(file))
      const checkStream = new Transform({
        transform(chunk, encoding, callback) {
          console.log(chunk.length)
          callback(undefined, chunk)
        },
      })

      const rsp = await undici.fetch(`${url}upload`, {
        body: stream.pipe(checkStream),
        method: 'POST',
      })

      console.log(await rsp.text())

      spinner.succeed('Registration done.')
    } catch (error) {
      console.error(error)
      // @ts-ignore
      spinner.fail(error.message)
      process.exit(1)
    }
  })

prog
  .command('config')
  .describe('Print config file content.')
  .action(async (opts) => {
    const config = getConfig(opts.profile)
    console.log('Path:', config.path)
    console.log(JSON.stringify(config.store, undefined, 2))
  })

prog.command('link [channel]').describe('Link.').action(linkCmd)

prog.parse(process.argv)
