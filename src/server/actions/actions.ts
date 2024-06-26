'use server';

import { signIn } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SES } from '@aws-sdk/client-ses';
import { Prisma } from '@prisma/client';
import { render } from '@react-email/render';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthError } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { isRedirectError } from 'next/dist/client/components/redirect';
import EmailVerificationEmail from '../../../emails/email-verification';

async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

async function generateJWT(user: any) {
  const jwtPayload: JWT = {
    id: user.id,
    email: user.email,
  };

  const jwtSecret = process.env.AUTH_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT secret is not set');
  }

  return jwt.sign(jwtPayload, jwtSecret, { expiresIn: '1h' });
}

async function sendEmail(user: any, token: string) {
  try {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const verifyUrl = `${process.env.AUTH_URL}/auth/verify-email?verifyToken=${token}`;

    if (!(region && accessKeyId && secretAccessKey)) {
      throw new Error('AWS credentials or region are not set');
    }

    const ses = new SES({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const emailHtml = render(EmailVerificationEmail({ verifyUrl }));

    const params = {
      Source: user.email,
      Destination: {
        ToAddresses: [user.email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: emailHtml,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'LiftLens Email Verification',
        },
      },
    };

    await ses.sendEmail(params);
  } catch (error) {
    throw new Error('Failed to send email');
  }
}

async function createVerificationToken(user: any, token: string) {
  await prisma.verificationToken.create({
    data: {
      identifier: user.id,
      token: token,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    },
  });
}

export async function registerUser({
  values,
}: {
  values: { email: string; password: string };
}) {
  const email = values.email;
  const password = values.password;

  try {
    const hashedPassword = await hashPassword(password?.toString() ?? '');

    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: email?.toString() ?? '',
          password: hashedPassword,
          email: email?.toString() ?? '',
        },
      });

      const token = await generateJWT(user);

      await createVerificationToken(user, token);

      // Attempt to send verification email
      await sendEmail(user, token);

      return user;
    });

    return {
      message: 'Registration successful. Please verify email and login.',
      type: 'success',
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        message:
          'An account with this email already exists. Please use a different email or login.',
        type: 'error',
      };
    }
    if (error instanceof Error && error.message === 'Failed to send email') {
      return {
        message:
          'Failed to send email verification email. Please check email and try again.',
        type: 'error',
      };
    }
    return {
      message: 'Registration failed. Please try again later.',
      type: 'error',
    };
  }
}

export async function validateToken({
  token,
}: {
  token: string;
}): Promise<string | null> {
  const jwtSecret = process.env.AUTH_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT secret is not set');
  }

  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!verificationToken) {
      return null;
    }

    const decodedToken = jwt.verify(token, jwtSecret);
    if (typeof decodedToken !== 'object' || !decodedToken.id) {
      throw new Error('Invalid token format');
    }

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: token,
        },
      },
    });

    return decodedToken.id;
  } catch (error) {
    throw new Error('Token validation failed');
  }
}

export async function credentialsSignIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    await signIn('credentials', { email, password });
    return {
      message: 'Successful sign in.',
      type: 'success',
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof Error) {
      const { type, cause } = error as AuthError;
      switch (type) {
        case 'CredentialsSignin':
          return {
            message: 'Invalid Credentials',
            type: 'error',
          };
        case 'CallbackRouteError':
          return {
            message: cause?.err?.toString(),
            type: 'error',
          };
        default:
          return {
            message: 'Something went wrong.',
            type: 'error',
          };
      }
    }
    throw error;
  }
}
