import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { hasSession } from "../../../lib/utils/apiChecks";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!hasSession(res, session)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} is not allowed.`);
  }

  try {
    const baseUrl =
      "https://old.online.ntnu.no/api/v1/group/online-groups/?page_size=999";

    const excludedCommitteeNames = [
      "HS",
      "Komiteledere",
      "Pangkom",
      "Bankom",
      "Fond",
      "Æresmedlemmer",
      "Bed&Fagkom",
      "Bekk_påmeldte",
      "booking",
      "Buddy",
      "CAG",
      "Eksgruppa",
      "Eldsterådet",
      "Ex-Komiteer",
      "interessegrupper",
      "ITEX",
      "ITEX-påmeldte",
      "kobKom",
      "Komiteer",
      "Redaksjonen",
      "Riddere",
      "techtalks",
      "Ex-Hovedstyret",
      "Tillitsvalgte",
      "Wiki - Komiteer access permissions",
      "Wiki - Online edit permissions",
      "X-Sport",
    ];

    const response = await fetch(baseUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();

    const groups = data.results
      // .filter(
      //   (group: { group_type: string }) => group.group_type === "committee"
      // )
      .filter(
        (group: { name_short: string }) =>
          !excludedCommitteeNames.includes(group.name_short) // Exclude committees by name_short
      )
      .map(
        (group: { name_short: string; name_long: string; email?: string }) => ({
          name_short: group.name_short,
          name_long: group.name_long,
          email: group.email || "No email provided",
        })
      );
    return res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

export default handler;
