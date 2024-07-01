import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  applicantTypeForCommittees,
  periodType,
} from "../../../lib/types/types";
import { useRouter } from "next/router";
import ApplicantTable from "../../../components/admin/ApplicantTable";

const CommitteeApplicantOverView: NextPage = () => {
  const { data: session } = useSession();
  const [applicants, setApplicants] = useState<applicantTypeForCommittees[]>(
    []
  );
  const [filteredApplicants, setFilteredApplicants] = useState<
    applicantTypeForCommittees[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const periodId = router.query["period-id"] as string;
  const [committees, setCommittees] = useState<string[] | null>(null);
  const [period, setPeriod] = useState<periodType | null>(null);
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(
    null
  );
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    if (!session || !periodId) return;

    const fetchPeriod = async () => {
      try {
        const res = await fetch(`/api/periods/${periodId}`);
        const data = await res.json();
        setPeriod(data.period);
      } catch (error) {
        console.error("Failed to fetch interview periods:", error);
      }
    };

    const fetchApplicants = async () => {
      try {
        const response = await fetch(`/api/committees/${periodId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch applicants");
        }

        const data = await response.json();

        setApplicants(data.applicants);
        setFilteredApplicants(data.applicants);

        const uniqueYears: string[] = Array.from(
          new Set(
            data.applicants.map((applicant: applicantTypeForCommittees) =>
              applicant.grade.toString()
            )
          )
        );
        setYears(uniqueYears);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
    fetchPeriod();
  }, []);

  useEffect(() => {
    let filtered = applicants;

    if (selectedCommittee) {
      filtered = filtered.filter((applicant) => {
        return applicant.preferences.some(
          (preference) =>
            preference.committee.toLowerCase() ===
            selectedCommittee.toLowerCase()
        );
      });
    }

    if (selectedYear) {
      filtered = filtered.filter(
        (applicant) => applicant.grade.toString() === selectedYear
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((applicant) =>
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredApplicants(filtered);
  }, [selectedCommittee, selectedYear, searchQuery, applicants]);

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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="mt-5 mb-6 text-3xl font-bold text-center">{`${period?.name}`}</h2>
      <div className="flex flex-wrap justify-center py-5 pt-10 space-x-5 max-w-full">
        <input
          type="text"
          placeholder="Søk etter navn"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border text-black border-gray-300 dark:bg-online-darkBlue dark:text-white dark:border-gray-600 mb-4"
        />
        {committees && (
          <select
            className="p-2 border text-black border-gray-300 dark:bg-online-darkBlue dark:text-white dark:border-gray-600 mb-4"
            value={selectedCommittee ?? ""}
            onChange={(e) => setSelectedCommittee(e.target.value)}
          >
            <option value="">Velg komite</option>
            {committees.map((committee, index) => (
              <option key={index} value={committee}>
                {committee}
              </option>
            ))}
          </select>
        )}

        <select
          className="p-2 border text-black border-gray-300 dark:bg-online-darkBlue dark:text-white dark:border-gray-600 mb-4"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Velg klasse</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}. Klasse
            </option>
          ))}
        </select>
      </div>
      {filteredApplicants.length > 0 ? (
        <div className="px-20">
          <ApplicantTable
            filteredApplications={filteredApplicants}
            applicationsExist={true}
            includePreferences={false}
            optionalCommitteesExist={false}
          />
        </div>
      ) : (
        <p>Fant ingen søkere</p>
      )}
    </div>
  );
};

export default CommitteeApplicantOverView;
