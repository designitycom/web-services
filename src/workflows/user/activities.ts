import { BigQuery } from "@google-cloud/bigquery";
import { Request, Response } from "express";
import { UserDTO } from "../../models/userDto";
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BigQuery
export async function getUserDto(userDto: UserDTO): Promise<UserDTO> {
  const bigquery = new BigQuery({
    keyFilename: process.env.BIGQUERY_SERVICEACCOUNT || "bigquery-sa.json",
    projectId: "designitybigquerysandbox",
    scopes: [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/bigquery",
    ],
  });
  // ASH-> deine the query
  const query = `SELECT *
  FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_EMAILS_DATASET}.${process.env.BIGQUERY_EMAILS_TABLE}\`
  LIMIT 100`;

  // console.log(query);
  const options = {
    query: query,
    location: "US",
  };

  //Run the query
  const [rows] = await bigquery.query(options);

  const result = rows.find((row) => row.Email == userDto.email);
  console.log(result)
  if(result != undefined){

    userDto.role=result.role;
    userDto.name=result.name;
    userDto.level=result.level;
  }

  return userDto;
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Get All NFT
