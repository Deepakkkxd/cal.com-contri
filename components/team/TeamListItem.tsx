import { TrashIcon, UsersIcon, DotsHorizontalIcon, LinkIcon, PencilAltIcon, ExternalLinkIcon } from "@heroicons/react/outline";
import Dropdown from "../ui/Dropdown";
import { useState } from "react";
import { Tooltip } from "@components/Tooltip";
import Link from "next/link";

export default function TeamListItem(props) {
  const [team, setTeam] = useState(props.team);

  const acceptInvite = () => invitationResponse(true);
  const declineInvite = () => invitationResponse(false);

  const invitationResponse = (accept: boolean) =>
    fetch("/api/user/membership", {
      method: accept ? "PATCH" : "DELETE",
      body: JSON.stringify({ teamId: props.team.id }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => {
      // success
      setTeam(null);
      props.onChange();
    });

  return (
    team && (
      <li className="divide-y">
        <div className="flex justify-between my-4">
          <div className="flex">
            <div className="relative rounded-full p-1 w-10 h-10 border border-gray-200"> 
                <img src={
                  props.team.logo
                        ? props.team.logo
                        : "https://eu.ui-avatars.com/api/?background=fff&color=039be5&name=" +
                          encodeURIComponent(props.team.name || "")
                } alt="Team Logo" className="rounded-full w-8 h-8"/>
            </div>
            {/* <UsersIcon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -mt-4 mr-2 h-6 w-6 inline" /> */}
            <div className="inline-block ml-3">
              <span className="font-bold text-neutral-700 text-sm">{props.team.name}</span>
              <span className="text-xs text-gray-400 -mt-1 block">{window.location.hostname}/
                {props.team.slug}
              </span>
            </div>
          </div>
          {props.team.role === "INVITEE" && (
            <div>
              <button
                className="btn-sm bg-transparent text-green-500 border border-green-500 px-3 py-1 rounded-sm ml-2"
                onClick={acceptInvite}>
                Accept invitation
              </button>
              <button className="btn-sm bg-transparent px-2 py-1 ml-1">
                <TrashIcon className="h-6 w-6 inline text-gray-400 -mt-1" onClick={declineInvite} />
              </button>
            </div>
          )}
          {props.team.role === "MEMBER" && (
            <div>
              <button
                onClick={declineInvite}
                className="btn-sm bg-transparent text-gray-400 border border-gray-400 px-3 py-1 rounded-sm ml-2">
                Leave
              </button>
            </div>
          )}
          {props.team.role === "OWNER" && (
            <div className="flex">
              <span className="h-6 px-3 py-1 bg-gray-50 text-xs capitalize self-center text-gray-700 rounded-md">Owner</span>
              <Tooltip content="Copy link">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.hostname + "/" + props.team.slug
                    );
                  }}
                  className="group text-neutral-400 p-2 border border-transparent hover:border-gray-200 ml-4 focus:ring-black focus:border-black rounded-md">
                  <LinkIcon className="group-hover:text-black w-5 h-5" />
                </button>
              </Tooltip>
              <Dropdown className="relative flex text-left">
                <button className="group text-neutral-400 p-2 border border-transparent hover:border-gray-200 focus:ring-black focus:border-black rounded-md">
                  <DotsHorizontalIcon className="group-hover:text-black w-5 h-5" />
                </button>
                <ul
                  role="menu"
                  className="z-10 origin-top-right absolute top-10 right-0 w-44 rounded-sm shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <li
                    className="text-sm text-gray-700  hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem">
                    <button className="flex items-center px-4 py-2 w-full text-left" onClick={() => props.onActionSelect("edit")}>
                      <PencilAltIcon className="group-hover:text-black text-gray-700 w-3.5 h-3.5 mr-2 inline-block" /> Edit team
                    </button>
                  </li>
                  <li
                    className="text-sm text-gray-700  hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem">
                      <Link href={`/${props.team.slug}`} passHref={true}>
                        <a target="_blank">
                          <button className="flex items-center px-4 py-2 w-full text-left">
                            <ExternalLinkIcon className="group-hover:text-black text-gray-700 w-3.5 h-3.5 mr-2 inline-block" /> Preview team page
                          </button>
                        </a>
                      </Link>
                  </li>
                  <li
                    className="text-sm text-gray-700  hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem">
                    <button className="flex items-center px-4 py-2 w-full text-left bg-red-50 text-red-700" onClick={() => props.onActionSelect("disband")}>
                      <TrashIcon className="group-hover:text-red text-red-700 w-3.5 h-3.5 mr-2 inline-block" /> Disband team
                    </button>
                  </li>
                </ul>
              </Dropdown>
            </div>
          )}
        </div>
        {/*{props.team.userRole === 'Owner' && expanded && <div className="pt-2">
      {props.team.members.length > 0 && <div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">Members</h2>
        <table className="table-auto mb-2 w-full">
          <tbody>
            {props.team.members.map( (member) => <tr key={member.email}>
              <td className="py-1 pl-2">Alex van Andel ({ member.email })</td>
              <td>Owner</td>
              <td className="text-right p-1">
                  <button className="btn-sm text-xs bg-transparent text-red-400 border border-red-400 px-3 py-1 rounded-sm ml-2"><UserRemoveIcon className="text-red-400 group-hover:text-gray-500 flex-shrink-0 -mt-1 mr-1 h-4 w-4 inline"/>Remove</button>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>}
      <button className="btn-sm bg-transparent text-gray-400 border border-gray-400 px-3 py-1 rounded-sm"><UserAddIcon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -mt-1 h-6 w-6 inline"/> Invite member</button>
      <button className="btn-sm bg-transparent text-red-400 border border-red-400 px-3 py-1 rounded-sm ml-2">Disband</button>
    </div>}*/}
      </li>
    )
  );
}
