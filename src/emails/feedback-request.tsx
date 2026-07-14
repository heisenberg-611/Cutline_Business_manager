import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'
import * as React from 'react'

interface FeedbackRequestEmailProps {
  businessName: string
  clientName: string
  projectName: string
  feedbackLink: string
  customBody?: string
  driveLink?: string
}

export const FeedbackRequestEmail = ({
  businessName = 'Cutline Studios',
  clientName = 'Client',
  projectName = 'Awesome Video Project',
  feedbackLink = 'https://cutlin.tech/feedback/xxx',
  customBody,
  driveLink,
}: FeedbackRequestEmailProps) => {
  const renderBody = () => {
    if (!customBody) {
      return (
        <>
          <Text className="text-black text-[14px] leading-[24px]">
            Hi {clientName},
          </Text>
          <Text className="text-black text-[14px] leading-[24px]">
            Your project <strong>"{projectName}"</strong> has just been delivered by {businessName}.
            We hope you love the final result!
          </Text>
          <Text className="text-black text-[14px] leading-[24px]">
            Could you take 2 minutes to let us know how we did? Your feedback helps us improve and serve you better.
          </Text>
        </>
      )
    }

    return customBody.split('\n').map((line, i) => (
      <Text key={i} className="text-black text-[14px] leading-[24px]">
        {line}
      </Text>
    ))
  }

  return (
    <Html>
      <Head />
      <Preview>We'd love your feedback on {projectName}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Project Delivered! 🎉
            </Heading>
            {renderBody()}
            <Section className="text-center mt-[32px] mb-[32px]">
              {driveLink && (
                <div className="mb-6">
                  <Text className="text-black text-[14px] leading-[24px] mb-2 font-medium">
                    Here are your final project assets:
                  </Text>
                  <Button
                    className="bg-blue-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={driveLink}
                  >
                    View Final Delivery Folder
                  </Button>
                </div>
              )}
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={feedbackLink}
              >
                Leave Feedback
              </Button>
            </Section>
            {!customBody && (
              <Text className="text-black text-[14px] leading-[24px]">
                Thanks for trusting us with your project.
                <br />- The {businessName} Team
              </Text>
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default FeedbackRequestEmail
