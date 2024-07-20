import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { applicantType, periodType } from "../../../lib/types/types";
import { useRouter } from "next/router";
import ApplicantsOverview from "../../../components/applicantoverview/ApplicantsOverview";
import {
  CalendarIcon,
  InboxIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Tabs } from "../../../components/Tabs";
import SendCommitteeMessage from "../../../components/committee/SendCommitteeMessage";
import CommitteeInterviewTimes from "../../../components/committee/CommitteeInterviewTimes";
import LoadingPage from "../../../components/LoadingPage";

const CommitteeApplicantOverView: NextPage = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const periodId = router.query["period-id"] as string;
  const [committees, setCommittees] = useState<string[] | null>(null);
  const [period, setPeriod] = useState<periodType | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [tabClicked, setTabClicked] = useState<number>(0);

  useEffect(() => {
    if (!session || !periodId) return;

    const fetchPeriod = async () => {
      try {
        const res = await fetch(`/api/periods/${periodId}`);
        const data = await res.json();
        setPeriod(data.period);
      } catch (error) {
        console.error("Failed to fetch interview periods:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriod();
  }, [session, periodId]);

  useEffect(() => {
    if (period && session) {
      const userCommittees = session.user!.committees;
      const periodCommittees = period.committees;

      if (period.optionalCommittees != null) {
        periodCommittees.push(...period.optionalCommittees);
      }

      const filteredCommittees = periodCommittees.filter(
        (committee) => userCommittees?.includes(committee.toLowerCase())
      );
      setCommittees(filteredCommittees);
    }
  }, [period, session]);

  if (!session || !session.user?.isCommitee) {
    return <p>Ingen Tilgang!</p>;
  }

  if (loading) {
    return <LoadingPage />;
  }

  const interviewPeriodEnd = period?.interviewPeriod.end
    ? new Date(period.interviewPeriod.end)
    : null;

  //Satt frist til 14 dager etter intervju perioden, så får man ikke tilgang
  if (
    interviewPeriodEnd &&
    interviewPeriodEnd.getTime() + 14 * 24 * 60 * 60 * 1000 <
      new Date().getTime()
  ) {
    return (
      <div className="flex flex-col h-screen text-center items-center justify-center px-20">
        <h1 className="text-3xl">Opptaket er ferdig!</h1>
        <br />
        <p className="text-lg">
          Du kan ikke lenger se søkere eller planlegge intervjuer.
        </p>
        <p className="text-lg">
          {" "}
          Har det skjedd noe feil eller trenger du tilgang til informasjonen? Ta
          kontakt med{" "}
          <a
            className="font-semibold underline transition-all hover:text-online-orange"
            href="mailto:appkom@online.ntnu.no"
          >
            Appkom
          </a>{" "}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Tabs
        activeTab={activeTab}
        setActiveTab={(index) => {
          setActiveTab(index);
          setTabClicked(index);
        }}
        content={[
          {
            title: "Intervjutider",
            icon: <CalendarIcon className="w-5 h-5" />,
            content: <CommitteeInterviewTimes period={period} />,
          },
          {
            title: "Melding",
            icon: <InboxIcon className="w-5 h-5" />,
            content: (
              <SendCommitteeMessage period={period} tabClicked={tabClicked} />
            ),
          },
          {
            title: "Søkere",
            icon: <UserGroupIcon className="w-5 h-5" />,
            content: (
              <ApplicantsOverview
                period={period}
                committees={committees}
                includePreferences={false}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default CommitteeApplicantOverView;