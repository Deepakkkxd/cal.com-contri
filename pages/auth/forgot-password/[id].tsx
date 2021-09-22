import { getCsrfToken } from "next-auth/client";
import prisma from "@lib/prisma";
import { HeadSeo } from "@components/seo/head-seo";
import React, { useMemo } from "react";
import debounce from "lodash.debounce";
import dayjs from "dayjs";
import Link from "next/link";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

export default function Page({
  resetPasswordRequest,
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  const [password, setPassword] = React.useState("");
  const handleChange = (e) => {
    setPassword(e.target.value);
  };

  const submitChangePassword = async ({ password, requestId }) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ requestId: requestId, password: password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json);
      } else {
        setSuccess(true);
      }

      return json;
    } catch (reason) {
      setError({ message: "An unexpected error occurred. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const debouncedChangePassword = debounce(submitChangePassword, 250);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    await debouncedChangePassword({ password, requestId: resetPasswordRequest.id });
  };

  const Success = () => {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">Success</h2>
          </div>
          <p>Your password has been reset. You can now login with your newly created password.</p>
          <Link href="/auth/login">
            <button
              type="button"
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Login
            </button>
          </Link>
        </div>
      </>
    );
  };

  const Expired = () => {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">Whoops</h2>
            <h2 className="text-3xl font-extrabold text-center text-gray-900">That Request is Expired.</h2>
          </div>
          <p>
            That request is expired. You can back and enter the email associated with your account and we will
            you another link to reset your password.
          </p>
          <Link href="/auth/forgot-password">
            <button
              type="button"
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Try Again
            </button>
          </Link>
        </div>
      </>
    );
  };

  const isRequestExpired = useMemo(() => {
    const now = dayjs();
    return dayjs(resetPasswordRequest.expires).isBefore(now);
  }, [resetPasswordRequest]);

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <HeadSeo title="Reset Password" description="Change your password" />
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 mx-2 space-y-6 bg-white rounded-lg shadow sm:px-10">
          {isRequestExpired && <Expired />}
          {!isRequestExpired && !success && (
            <>
              <div className="space-y-6">
                <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">Reset Password</h2>
                <p>Enter the new password you&apos;d like for your account.</p>
                {error && <p className="text-red-600">{error.message}</p>}
              </div>
              <form className="space-y-6" onSubmit={handleSubmit} action="#">
                <input name="csrfToken" type="hidden" defaultValue={csrfToken} hidden />
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1">
                    <input
                      onChange={handleChange}
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="password"
                      required
                      className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                      loading ? "cursor-not-allowed" : ""
                    }`}
                  >
                    {loading && (
                      <svg
                        className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    Submit
                  </button>
                </div>
              </form>
            </>
          )}
          {!isRequestExpired && success && (
            <>
              <Success />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    notFound: true,
  };
  const id = context.params.id;

  try {
    const resetPasswordRequest = await prisma.resetPasswordRequest.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        expires: true,
      },
    });

    return {
      props: {
        resetPasswordRequest: {
          ...resetPasswordRequest,
          expires: resetPasswordRequest.expires.toString(),
        },
        id,
        csrfToken: await getCsrfToken({ req: context.req }),
      },
    };
  } catch (reason) {
    return {
      notFound: true,
    };
  }
}
