import { Collection, Db, MongoClient, ObjectId, UpdateResult } from "mongodb";
import clientPromise from "./mongodb";
import { commiteeType } from "../types/types";
import { co } from "@fullcalendar/core/internal-common";

let client: MongoClient;
let db: Db;
let committees: Collection<commiteeType>;

async function init() {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db();
    committees = db.collection("committee");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to establish connection to database");
  }
}

(async () => {
  await init();
})();

const userHasAccessList = (
  userCommittees: string[],
  dbCommittees: string[]
) => {
  return dbCommittees.some((dbCommittee) =>
    userCommittees.includes(dbCommittee)
  );
};

const userHasAccessCommittee = (
  userCommittees: string[],
  dbCommittees: string
) => {
  return userCommittees.includes(dbCommittees);
};

export const updateCommitteeMessage = async (
  committee: string,
  periodId: string,
  message: string,
  userCommittees: string[]
) => {
  try {
    if (!committees) await init();
    if (!userHasAccessCommittee(userCommittees, committee)) {
      return { error: "User does not have access to this committee" };
    }

    const result = await committees.findOneAndUpdate(
      { committee: committee, periodId: periodId },
      { $set: { message: message } },
      { returnDocument: "after" }
    );

    const updatedCommittee = result;

    if (updatedCommittee) {
      return { updatedMessage: updatedCommittee.message };
    } else {
      return { error: "Failed to update message" };
    }
  } catch (error) {
    return { error: "Failed to update message" };
  }
};

export const getCommittees = async (
  periodId: string,
  selectedCommittee: string,
  userCommittees: string[]
) => {
  try {
    if (!committees) await init();
    if (!userHasAccessCommittee(userCommittees, selectedCommittee)) {
      return { error: "User is unauthenticated" };
    }

    const result = await committees
      .find({ committee: selectedCommittee, periodId: periodId })
      .toArray();
    return { committees: result };
  } catch (error) {
    return { error: "Failed to fetch committees" };
  }
};

export const getCommittee = async (id: string) => {
  try {
    if (!committees) await init();
    const result = await committees.findOne({ _id: new ObjectId(id) });
    if (result) {
      return { committee: result };
    } else {
      return { error: "No committee found with the specified ID" };
    }
  } catch (error) {
    return { error: "Failed to fetch committee" };
  }
};

export const createCommittee = async (
  committeeData: commiteeType,
  userCommittes: string[],
  periodId: string
) => {
  try {
    if (!committees) await init();
    if (!userHasAccessCommittee(userCommittes, committeeData.committee)) {
      return { error: "User does not have access to this committee" };
    }

    if (!ObjectId.isValid(periodId)) {
      return { error: "Invalid periodId" };
    }

    const parsedCommitteeData =
      typeof committeeData === "string"
        ? JSON.parse(committeeData)
        : committeeData;

    const count = await committees.countDocuments({
      periodId: periodId,
      committee: committeeData.committee,
    });

    if (count > 0) {
      return { error: "Committee Times already exists" };
    }

    const result = await committees.insertOne(parsedCommitteeData);
    if (result.insertedId) {
      const insertedCommittee = await committees.findOne({
        _id: result.insertedId,
      });
      if (insertedCommittee) {
        return { committee: insertedCommittee };
      } else {
        return { error: "Failed to retrieve the created committee" };
      }
    } else {
      return { error: "Failed to create committee" };
    }
  } catch (error) {
    return { error: "Failed to create committee" };
  }
};

export const deleteCommittee = async (
  committee: string,
  periodId: string,
  userCommittees: string[]
) => {
  try {
    if (!committees) await init();
    if (!userHasAccessCommittee(userCommittees, committee)) {
      return { error: "User does not have access to this committee" };
    }

    const count = await committees.countDocuments({
      committee: committee,
      periodId: periodId,
    });

    if (count === 0) {
      return { error: "Committee not found or already deleted" };
    }

    const result = await committees.deleteOne({
      committee: committee,
      periodId: periodId,
    });

    if (result.deletedCount === 1) {
      return { message: "Committee deleted successfully" };
    } else {
      return { error: "Committee not found or already deleted" };
    }
  } catch (error) {
    return { error: "Failed to delete committee" };
  }
};
