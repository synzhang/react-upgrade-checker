import { FC, useEffect } from 'react'

type Props = {
  targetPath: string
  bundleRegex: RegExp
  checkInterval?: number
  message?: string
  callback?: () => void
}

let hash = null
let interval = null

const UpgradeChecker: FC<Props> = props => {
  const {
    targetPath = '/',
    bundleRegex = /app\.bundle\.js\?(\w+)/,
    checkInterval = 60 * 1000,
    message = 'New changes are available!',
    callback,
  } = props

  useEffect(() => {
    getCurrentHash({
      targetPath,
      bundleRegex,
    })
      .then((newHash) => {
        hash = newHash
      })
      .catch(e => {
        console.error(e)
      })

    interval = createInterval({
      targetPath,
      bundleRegex,
      checkInterval,
      message,
      callback,
    })

    return () => clearInterval(interval)
  }, [])

  return null
}

async function getCurrentHash({
  targetPath,
  bundleRegex,
}: {
  targetPath: Props['targetPath']
  bundleRegex: Props['bundleRegex']
}) {
  const html = await window.fetch(targetPath).then((res) => res.text())
  const [, hash] = html.match(bundleRegex) || []
  return hash
}

const createInterval = ({
  targetPath,
  bundleRegex,
  checkInterval,
  message,
  callback,
}: {
  targetPath: Props['targetPath']
  bundleRegex: Props['bundleRegex']
  checkInterval: Props['checkInterval']
  message: Props['message']
  callback: Props['callback']
}) => {
  setInterval(async () => {
    const newHash = await getCurrentHash({
      targetPath,
      bundleRegex,
    })

    if (hash && newHash !== hash) {
      clearInterval(interval)

      if (window.confirm(message)) {
        window.location.reload()
      } else {
        interval = createInterval({
          targetPath,
          bundleRegex,
          checkInterval,
          message,
          callback,
        })
      }
    }
  }, checkInterval)
}

export default UpgradeChecker
