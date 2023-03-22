import { useEffect } from "react";

import { trpc } from "@calcom/trpc";
import { Select } from "@calcom/ui";

import { useFilterContext } from "../UseFilterContext";

const TeamList = () => {
  const { filter, setSelectedTeamId } = useFilterContext();
  const { selectedTeamId } = filter;
  const { data, isSuccess } = trpc.viewer.analytics.teamListForUser.useQuery();

  useEffect(() => {
    if (data && data?.length > 0) {
      setSelectedTeamId(data[0].id);
    }
  }, [data]);

  const UserListOptions =
    data?.map((item) => ({
      value: item.id,
      label: item.name ?? "",
    })) || ([{ label: "Empty", value: -1 }] as { value: number; label: string }[]);

  return (
    <>
      {isSuccess && selectedTeamId && data && data?.length > 0 && (
        <Select
          isSearchable={false}
          isMulti={false}
          value={
            selectedTeamId
              ? {
                  value: selectedTeamId,
                  label: data.find((item: { id: number; name: string }) => item.id === selectedTeamId)?.name,
                }
              : null
          }
          defaultValue={selectedTeamId ? { value: data[0].id, label: data[0].name } : null}
          className="mb-0 h-[38px] w-full capitalize md:min-w-[150px] md:max-w-[200px]"
          options={UserListOptions}
          onChange={(input: { value: number; label: string }) => {
            if (input) {
              setSelectedTeamId(input.value);
            }
          }}
        />
      )}
    </>
  );
};

export { TeamList };
