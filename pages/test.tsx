import { NextPage } from "next";
import React from "react";
import { IUser } from "../types";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import getUser from "../services/getUser";

const Test: NextPage = () => {
  const { isLoading, isError, isSuccess, data } = useQuery<IUser, Error>(
    ["user", { id: 1 }],
    getUser
  );

  return (
    <div className="text-3xl font-bold underline">
      {isLoading ? <p>Loading...</p> : <div>{data?.name}</div>}
      test
    </div>
  );
};

export default Test;
