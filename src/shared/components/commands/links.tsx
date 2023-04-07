import {HTMLProps} from 'react'

export interface LinkProps extends HTMLProps<HTMLAnchorElement> {
  href: string
}

export function InternalLink(props: LinkProps) {
  return <a {...props} />
}

export function ExternalLink(props: LinkProps) {
  return <a {...props} />
}
