import Head from 'next/head';
import Link from 'next/link';
import prisma from '../lib/prisma';
import Shell from '../components/Shell';
import { signIn, useSession, getSession } from 'next-auth/client';
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Home(props) {
    const [ session, loading ] = useSession();
    const { t, i18n } = useTranslation('common');
    const locale = i18n.language;

    if (loading) {
      return <p className="text-gray-400">{t("loading")}</p>;
    }
    if (!session) {
        window.location.href = "/auth/login";
        return;
    }

    return (
      <div>
        <Head>
          <title>Calendso</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Shell heading="Dashboard">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {t("welcome_to_calendso")}
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>{t("get_started_by_connecting")}</p>
                  </div>
                  <div className="mt-3 text-sm">
                    <Link href="/integrations">
                      <a className="font-medium text-blue-600 hover:text-blue-500">
                        {t("set_up_your_first")}
                        <span aria-hidden="true">&rarr;</span>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg shadow px-5 py-6 md:py-7 sm:px-6">
                <div className="mb-8 sm:flex sm:items-center sm:justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {t("your_integration")}{" "}
                  </h3>
                  <div className="mt-3 sm:mt-0 sm:ml-4">
                    <Link href="/integrations">
                      <a className="text-sm text-gray-400">{t("view_more")}</a>
                    </Link>
                  </div>
                </div>
                <ul className="divide-y divide-gray-200">
                  {props.credentials.map((integration) => (
                    <li className="pb-4 flex">
                      {integration.type == "google_calendar" && (
                        <img
                          className="h-10 w-10 mr-2"
                          src="integrations/google-calendar.png"
                          alt="Google Calendar"
                        />
                      )}
                      {integration.type == "office365_calendar" && (
                        <img
                          className="h-10 w-10 mr-2"
                          src="integrations/office-365.png"
                          alt="Office 365 / Outlook.com Calendar"
                        />
                      )}
                      <div className="ml-3">
                        {integration.type == "office365_calendar" && (
                          <p className="text-sm font-medium text-gray-900">
                            Office 365 / Outlook.com Calendar
                          </p>
                        )}
                        {integration.type == "google_calendar" && (
                          <p className="text-sm font-medium text-gray-900">
                            Google Calendar
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {t("calendar_integration")}
                        </p>
                      </div>
                    </li>
                  ))}
                  {props.credentials.length == 0 && (
                    <div className="text-center text-gray-400 py-2">
                      <p>{t("you_havent_added_any")}</p>
                    </div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </Shell>
      </div>
    );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);
    let credentials = [];

    if (session) {
        const user = await prisma.user.findFirst({
            where: {
                email: session.user.email,
            },
            select: {
                id: true
            }
        });

        credentials = await prisma.credential.findMany({
            where: {
                userId: user.id,
            },
            select: {
                type: true
            }
        });
    }
    return {
      props: {
          credentials,
          ...await serverSideTranslations(context.locale, ['common']),
        }, // will be passed to the page component as props
    }
}