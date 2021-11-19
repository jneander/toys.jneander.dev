import NextLink from 'next/link'
import {HTMLProps} from 'react'

export interface LinkProps extends HTMLProps<HTMLAnchorElement> {
  href: string
}

export function InternalLink(props: LinkProps) {
  const {href, ...anchorProps} = props

  return (
    <NextLink href={href}>
      <a {...anchorProps} />
    </NextLink>
  )
}

export function ExternalLink(props: LinkProps) {
  return <a {...props} />
}
