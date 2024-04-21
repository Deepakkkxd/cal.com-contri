import { Table, TableBody, TableCell, TableRow, Text } from "@tremor/react";

import type { User } from "@calcom/prisma/client";
import { Avatar } from "@calcom/ui";

export const TotalUserFeedbackTable = ({
  data,
}: {
  data:
    | {
        userId: number | null;
        user: Pick<User, "avatarUrl" | "name">;
        emailMd5?: string;
        count?: number;
        averageRating?: number;
        username?: string;
      }[]
    | undefined;
}) => {
  return (
    <Table>
      <TableBody>
        <>
          {data &&
            data?.length > 0 &&
            data?.map((item) => (
              <TableRow key={item.userId}>
                <TableCell className="flex flex-row">
                  <Avatar
                    alt={item.user.name || ""}
                    size="sm"
                    imageSrc={item.user.avatarUrl}
                    title={item.user.name || ""}
                    className="m-2"
                  />
                  <p className="text-default mx-0 my-auto">
                    <strong>{item.user.name}</strong>
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <Text>
                    <strong className="text-default">
                      {item.averageRating ? item.averageRating : item.count}
                    </strong>
                  </Text>
                </TableCell>
              </TableRow>
            ))}
        </>
      </TableBody>
    </Table>
  );
};
