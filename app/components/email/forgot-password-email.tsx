import { Container, Html, Link, Text } from '@react-email/components'
import React from 'react'

export default function ForgotPasswordEmail({
  magicLink,
  otp,
}: {
  magicLink: string
  otp: string
}) {
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h1>
          <Text>Notes Password Reset</Text>
        </h1>
        <p>
          <Text>
            Here&apos;s your verification code: <strong>{otp}</strong>
          </Text>
        </p>
        <p>
          <Text>Or click the link:</Text>
        </p>
        <Link href={magicLink}>Verify</Link>
      </Container>
    </Html>
  )
}

export function getForgotPasswordEmail(
  code: string,
  magicLink: string,
): React.ReactElement {
  return <ForgotPasswordEmail magicLink={magicLink} otp={code} />
}
