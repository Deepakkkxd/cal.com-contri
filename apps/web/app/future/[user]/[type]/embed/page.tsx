import { withAppDirSsr } from "app/WithAppDirSsr";
import withEmbedSsrAppDir from "app/WithEmbedSSR";
import { WithLayout } from "app/layoutHOC";

import { getServerSideProps, type PageProps } from "@lib/[user]/[type]/getServerSideProps";

import LegacyPage from "@components/pages/[user]/[type]";

const getData = withAppDirSsr<PageProps>(getServerSideProps);

const getEmbedData = withEmbedSsrAppDir(getData);

export default WithLayout({ getLayout: null, getData: getEmbedData, Page: LegacyPage })<"P">;
