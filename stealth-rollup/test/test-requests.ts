import { ethers } from "ethers";
import { stackrConfig } from "../stackr.config";
import { ActionSchema } from "@stackr/stackr-js";
import { AnnouncementActionInput } from "../src/state";

const actionSchemaType = {
  type: "String",
  stealthAddress: "Address",
  ephemeralPublicKey: "Bytes",
  viewTag: "Uint",
  publicAddress: "Address",
  stelathMetaAddress: "Bytes",
  schemeId: "Uint",
};

const actionInput = new ActionSchema("update-announcement", actionSchemaType);

const getData = async () => {
  const wallet = ethers.Wallet.createRandom();

  const AnnounceData = {
    type: "announce",
    stealthAddress: "0x084c53dad73b23f7d709fdcc2edbe5caa44bccce",
    ephemeralPublicKey:
      "0x0391e14240e98bc771f00b5ad49f3f7ec92fd498e43f04708fd61f02fddc0931f2",
    viewTag: 33,
    publicAddress: "0x084c53dad73b23f7d709fdcc2edbe5caa44bccce",
    stelathMetaAddress:
      "0x02f868433a12a9d57e355176a00ee6b5c80ed1fe2c939d81062e0251081994f039022290fba566a42824f283e54582fc4fefb0767f04551c748aa8bd8b66bef677cf",
    schemeId: 0,
  };

  const sign = await wallet.signTypedData(
    stackrConfig.domain,
    actionInput.EIP712TypedData.types,
    AnnounceData
  );

  console.log(actionInput.EIP712TypedData.types);

  const payload = JSON.stringify({
    msgSender: wallet.address,
    signature: sign,
    payload: AnnounceData,
  });

  console.log(payload);

  return payload;
};

const run = async () => {
  const start = Date.now();
  const payload = await getData();

  const res = await fetch("http://localhost:8080/update", {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const end = Date.now();

  const json = await res.json();

  const elapsedSeconds = (end - start) / 1000;
  const requestsPerSecond = 1 / elapsedSeconds;

  console.log(`Requests per second: ${requestsPerSecond.toFixed(2)}`);
  console.log("response : ", json);

  const res1 = await fetch("http://localhost:8080/announcements", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(await res1.json());

  const res2 = await fetch("http://localhost:8080/registers", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(await res2.json());
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let sent = 0;

while (true) {
  sent++;
  await run();
  if (sent === 1) {
    break;
  }
}
