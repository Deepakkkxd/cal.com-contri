import { GetServerSideProps } from "next";
import Head from "next/head";

import Theme from "@components/Theme";
import { getTeam } from "../../lib/getTeam";
import Team from "@components/team/screens/team";

export default function Page(props) {
  const { isReady } = Theme();

  return (
    isReady && (
      <div>
        <Head>
          <title>{props.team.name} | Calendso</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="max-w-2xl mx-auto my-24">
          <Team team={props.team} />
        </main>
      </div>
    )
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const teamIdOrSlug = Array.isArray(context.query?.idOrSlug)
    ? context.query.idOrSlug.pop()
    : context.query.idOrSlug;

  const team = await getTeam(teamIdOrSlug);

  if (!team) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      team,
    },
  };
};

// Auxiliary methods
export function getRandomColorCode(): string {
  let color = "#";
  for (let idx = 0; idx < 6; idx++) {
    color += Math.floor(Math.random() * 10);
  }
  return color;
}
