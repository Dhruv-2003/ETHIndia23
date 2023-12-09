import React from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box } from "@chakra-ui/react";
import {
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from "@chakra-ui/react";
import { useState } from "react";
import { getUserMetadatAddress } from "@/utils/rollupMethods";
import { getStealthAddress } from "@/utils/stealthMethods";
import { erc20ABI, useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseEther } from "viem";

const Modal = () => {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [receiverAddress, setReceieverAddress] = useState<`0x${string}`>();
  const [stealthMetaAddress, setStealthMetaAddress] = useState<string>();
  const [tokenAddress, setTokenAddress] = useState<`0x${string}`>();
  const [amount, setAmount] = useState<string>();
  const [checkReceiverData, setCheckReceiverData] = useState<boolean>(false);
  const [checkTokenTransfer, setCheckTokenTransfer] = useState<boolean>(true);
  const [stealthAddressData, setStealthAddressData] = useState<{
    schemeId: string;
    stealthAddress: `0x${string}`;
    ephemeralPublicKey: string;
    viewTag: string;
  }>();
  const [page, setPage] = useState<number>(0);
  const [transactionHash, setTransactionHash] = useState<string>();

  const steps = [
    { title: "Generation", description: "Stealth Address" },
    { title: "Transfer", description: "Transfer funds" },
    { title: "Announce", description: "Announce SA and EPK" },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const handleStepper = () => {
    const condition = true;

    if (condition) {
      if (activeStep < steps.length) {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const handleGetReceiverData = async () => {
    try {
      if (!receiverAddress) {
        console.log("No Receiver Address Found");
        return;
      }
      const userMetadata = await getUserMetadatAddress(receiverAddress);
      console.log(userMetadata);
      if (!userMetadata) {
        console.log("No Metadata address found");
        return;
      }
      setStealthMetaAddress(userMetadata.stelathMetaAddress);
      const stealthAddressData = await getStealthAddress(
        userMetadata.stelathMetaAddress
      );
      if (!stealthAddressData) {
        console.log("No Stealth address found");
        return;
      }
      setStealthAddressData(stealthAddressData);
      if (stealthAddressData) {
        await setCheckReceiverData(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTokenTransfer = async () => {
    try {
      if (!stealthAddressData) {
        console.log("No Stealth address found");
        return;
      }
      // transfer the funds to the stealth address
      if (!walletClient) {
        console.log("No Wallet Client Found");
        return;
      }
      if (!amount) {
        console.log("No Wallet Client Found");
        return;
      }

      if (tokenAddress == "0xe") {
        try {
          const hash = await walletClient.sendTransaction({
            account: account,
            //@ts-ignore
            to: stealthAddressData.stealthAddress,
            value: parseEther(amount),
          });
          console.log(hash);
          console.log("Transaction Sent");
          const transaction = await publicClient.waitForTransactionReceipt({
            hash: hash,
          });
          console.log(transaction);
        } catch (error) {
          console.log(error);
        }
      } else if (tokenAddress != "0xe" && tokenAddress) {
        // perform token Transfer
        const data = await publicClient?.simulateContract({
          account,
          address: tokenAddress,
          abi: erc20ABI,
          functionName: "transfer",
          args: [stealthAddressData.stealthAddress, parseEther(amount)],
        });
        console.log(data);
        if (!walletClient) {
          console.log("Wallet client not found");
          return;
        }
        // @ts-ignore
        const hash = await walletClient.writeContract(data.request);
        console.log("Transaction Sent");
        const transaction = await publicClient.waitForTransactionReceipt({
          hash: hash,
        });
        console.log(transaction);
        setTransactionHash(transaction.transactionHash);
      } else {
        console.log("No Token Address Found");
        return;
      }
      // await handleStepper();
      setCheckTokenTransfer(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAnnounce = async () => {
    try {
      if (!stealthAddressData) {
        console.log("No Stealth address found");
        return;
      }

      // update the Registery contract with the stealth address data

      // await handleStepper();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-screen bg-gradient-to-r from-white via-blue-100 to-rose-200">
      <div className="flex flex-col mx-auto justify-between w-full">
        <div className="mt-20 flex mx-auto justify-center">
          <Tabs variant="soft-rounded" colorScheme="blue">
            <div className="flex mx-auto px-2 w-[300px] py-1 bg-white rounded-xl">
              <TabList>
                <Tab>Transfer</Tab>
                <Tab>Withdraw</Tab>
                <Tab>History</Tab>
              </TabList>
            </div>
            <TabPanels>
              <TabPanel>
                <div className="flex flex-col px-6 py-2 bg-white rounded-xl w-full mt-6">
                  {/* <p className="font-mono text-md">Transfer</p> */}
                  <Stepper className="mt-3" size="sm" index={activeStep}>
                    {steps.map((step, index) => (
                      <Step key={index}>
                        <StepIndicator>
                          <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                          />
                        </StepIndicator>

                        <Box flexShrink="0">
                          <StepTitle>{step.title}</StepTitle>
                          <StepDescription>{step.description}</StepDescription>
                        </Box>

                        <StepSeparator />
                      </Step>
                    ))}
                  </Stepper>
                  <div className="mt-5 flex flex-col"></div>
                  {activeStep == 0 && page == 0 && (
                    <div>
                      {!checkReceiverData && (
                        <div className="flex flex-col">
                          <div className="mt-5 flex flex-col">
                            <p className="text-md text-gray-600">
                              address of receiver
                            </p>
                            <input
                              type="text"
                              className="px-4 mt-2 py-3 border border-gray-100 rounded-xl w-full"
                              placeholder="Enter address of receiver"
                              onChange={(e) =>
                                setReceieverAddress(e.target.value)
                              }
                            ></input>
                          </div>
                          <div className="mt-7 mx-auto">
                            <button
                              onClick={() => handleGetReceiverData()}
                              className="px-6 mx-auto flex justify-center py-2 bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                            >
                              Generate Stealth for Receiver
                            </button>
                          </div>
                          <div className="mt-3 flex justify-center text-center mx-auto mb-3">
                            <p className="text-sm text-gray-500 w-2/3 text-center">
                              The identity of the receiver will be masked using
                              the stealth address
                            </p>
                          </div>
                        </div>
                      )}
                      {checkReceiverData && (
                        <div className="flex flex-col">
                          <div className="mt-1 flex flex-col">
                            <p className="text-lg text-center text-blue-600">
                              Addresses Generated
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">
                              Stealth Address
                            </p>
                            <p className="text-lg mt-1 text-gray-600">
                              {stealthAddressData?.stealthAddress}
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">
                              Ephemeral Public Key
                            </p>
                            <p className="text-lg mt-1 text-gray-600">
                              {stealthAddressData?.ephemeralPublicKey}
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">View Tag</p>
                            <p className="text-lg mt-1 text-gray-600">
                              {stealthAddressData?.viewTag}
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">
                              Meta Address
                            </p>
                            <p className="text-lg mt-1 text-gray-600">
                              {stealthMetaAddress}
                            </p>
                          </div>
                          <div className="w-full flex mt-6 justify-between">
                            <button className=""></button>
                            <button
                              onClick={() => {
                                setPage((currPage) => currPage + 1);
                                setActiveStep(activeStep + 1);
                              }}
                              className="bg-white border border-blue-500 rounded-xl px-7 py-1 text-lg text-blue-500 font-semibold"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {activeStep == 1 && page == 1 && (
                    <div>
                      {!checkTokenTransfer && (
                        <div className="flex flex-col">
                          <div className="mt-5 flex flex-col">
                            <p className="text-md text-gray-600">amount</p>
                            <input
                              className="px-4 mt-2 py-3 border border-gray-100 rounded-xl text-2xl w-full"
                              placeholder="0"
                              onChange={(e) => setAmount(e.target.value)}
                            ></input>
                          </div>
                          <div className="mt-7 mx-auto">
                            <button
                              onClick={() => handleTokenTransfer()}
                              className="px-6 mx-auto flex justify-center py-2 bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                            >
                              Transfer Funds
                            </button>
                          </div>
                          <div className="mt-3 flex justify-center text-center mx-auto mb-3">
                            <p className="text-sm text-gray-500 w-2/3 text-center">
                              The identity of the receiver will be masked using
                              the stealth address
                            </p>
                          </div>
                        </div>
                      )}{" "}
                      {checkTokenTransfer && (
                        <div className="flex flex-col">
                          <div className="mt-1 flex flex-col">
                            <p className="text-lg text-center text-blue-600">
                              Token Transfered
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">
                              Transaction hash
                            </p>
                            <p className="text-lg mt-1 text-gray-600">
                              {transactionHash}
                            </p>
                          </div>
                          <div className="w-full flex mt-6 justify-between">
                            <button
                              onClick={() => {
                                setPage((currPage) => currPage - 1);
                                setActiveStep(activeStep - 1);
                                setStealthAddressData(null);
                              }}
                              className="bg-white border border-blue-500 rounded-xl px-7 py-1 text-lg text-blue-500 font-semibold"
                            >
                              Prev
                            </button>
                            <button
                              onClick={() => {
                                setPage((currPage) => currPage + 1);
                                setActiveStep(activeStep + 1);
                              }}
                              className="bg-white border border-blue-500 rounded-xl px-7 py-1 text-lg text-blue-500 font-semibold"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {activeStep == 2 && (
                    <div>
                      <div className="mt-5 flex flex-col"></div>
                      <div className="mt-2 mx-auto">
                        <button
                          onClick={() => handleStepper()}
                          className="px-6 mx-auto flex justify-center py-2 bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                        >
                          Announce Stealth Address
                        </button>
                      </div>
                      <div className="mt-3 flex justify-center text-center mx-auto mb-3">
                        <p className="text-sm text-gray-500 w-2/3 text-center">
                          The identity of the receiver will be masked using the
                          stealth address
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabPanel>
              <TabPanel>
                <div className="flex flex-col px-6 py-2 bg-white rounded-xl w-full mt-6">
                  <p className="font-mono text-md">Withdraw</p>
                  <div className="mt-5 flex flex-col">
                    <p className="text-md text-gray-600">amount</p>
                    <input
                      className="px-4 mt-2 py-3 border border-gray-100 rounded-xl text-2xl w-[420px]"
                      placeholder="0"
                    ></input>
                  </div>
                  <div className="mt-5 flex flex-col">
                    <p className="text-md text-gray-600">
                      address of receiving wallet
                    </p>
                    <input
                      className="px-4 mt-2 py-3 border border-gray-100 rounded-xl w-[420px]"
                      placeholder="Enter address of receiving wallet"
                    ></input>
                  </div>
                  <div className="mt-7 mx-auto">
                    <button className="px-6 py-2 bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200">
                      Withdraw
                    </button>
                  </div>
                  <div className="mt-3 flex justify-center text-center mx-auto mb-3">
                    <p className="text-sm text-gray-500 w-[300px] text-center">
                      Amount will be withdrawn from Stealth and deposited into
                      the provided wallet addrress
                    </p>
                  </div>
                </div>
              </TabPanel>
              <TabPanel>
                <div className="flex flex-col w-[460px] px-6 py-2 bg-white rounded-xl mt-6">
                  <p className="text-lg text-center text-gray-600">
                    Make your first Transfer or Withdrawal to create your
                    History.
                  </p>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Modal;
