import React, { Fragment, useContext, useEffect, useState } from "react";
import { Breadcrumbs } from "../../AbstractElements";
import {
  Col,
  Container,
  Row,
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import {
  arrivalContainer,
  checkValidContainer,
  fetchContainerByNumber,
  getPrefillData,
} from "../../Redux/slices/containerSlice";
import { useDispatch } from "react-redux";
import axios from "axios";
import { API_URL } from "../../Config/AppConstant";
import { toast } from "react-toastify";
import containerService from "../../Services/container";
import operationService from "../../Services/operation";

const Operation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { layoutURL } = useContext(CustomizerContext);

  const [containerNumber, setContainerNumber] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("");
  const [containerError, setContainerError] = useState("");
  const [isValidContainer, setIsValidContainer] = useState(0);
  const [allotmentType, setAllotmentType] = useState(null);
  const [isDestuffRequest, setIsDestuffRequest] = useState(false);
  const [arrivalLoadStatus, setArrivalLoadStatus] = useState({});
  const lastOperation = localStorage.getItem("operation");

  const containerRegex = /^[A-Z]{4}\d{7}$/;

  useEffect(() => {
    const fetchAllotmentType = async () => {
      if (containerRegex.test(containerNumber)) {
        try {
          const res =
            await operationService.allotmentStuffingDetailsByContainerNo(
              containerNumber
            );
          console.log("allotmentType222:", res);

          if (res.success) {
            setAllotmentType(res.data.allotment_type);
          } else {
            setAllotmentType(null);
          }
        } catch (error) {
          // console.error("Error fetching allotment type:", error);
          setAllotmentType(null);
        }
      } else {
        setAllotmentType(null); // reset if invalid
      }
    };
    if (
      selectedOperation == "8" ||
      selectedOperation == "6" ||
      selectedOperation == "11"
    ) {
      fetchAllotmentType();
    }
  }, [selectedOperation, containerNumber]);

  ////
  useEffect(() => {
    // 2. Fetch Arrival Load Status
    const fetchArrivalLoadStatus = async () => {
      if (containerRegex.test(containerNumber)) {
        try {
          if (lastOperation == "2") {
            const res = await operationService.arrivalContainer(
              containerNumber
            );
            console.log("Arrival Result::", res);
            setArrivalLoadStatus(res?.data?.load_status || null);
          } else if (lastOperation == "3") {
            const res = await operationService.destuffFCLContainer(
              containerNumber
            );
            console.log("FCL Response::", res);
            // setArrivalLoadStatus(res?.data)
          }
        } catch {
          setArrivalLoadStatus(null);
        }
      } else {
        setArrivalLoadStatus(null);
      }
    };
    fetchArrivalLoadStatus();
  }, [containerNumber]);

  ////

  // useEffect(() => {
  //   const state = location?.state;

  //   if (state?.operation) {
  //     setSelectedOperation(state.operation);
  //     localStorage.setItem("selectedOperation", state.operation);
  //   } else {
  //     const savedOperation = localStorage.getItem("selectedOperation");
  //     if (savedOperation) {
  //       setSelectedOperation(savedOperation);
  //     }
  //   }

  //   if (state?.containerNumber) {
  //     setContainerNumber(state.containerNumber);
  //   }
  // }, [location]);

  useEffect(() => {
    const state = location?.state;

    if (state?.operation) {
      setSelectedOperation(state.operation);
      localStorage.setItem("selectedOperation", state.operation);

      if (state.operation === "7") {
        setContainerNumber("NOT ASSIGNED");
      } else if (state?.containerNumber) {
        setContainerNumber(state.containerNumber);
      }
    } else {
      const savedOperation = localStorage.getItem("selectedOperation");
      if (savedOperation) {
        setSelectedOperation(savedOperation);
        if (savedOperation === "7") {
          setContainerNumber("NOT ASSIGNED");
        }
      }
    }
  }, [location]);

  const handleOperationChange = (e) => {
    const value = e.target.value;
    setSelectedOperation(value);
    localStorage.setItem("selectedOperation", value);
    setContainerNumber(value === "7" ? "NOT ASSIGNED" : "");
    setContainerError("");
  };

  const handleContainerChange = (e) => {
    const value = e.target.value.toUpperCase();
    setContainerNumber(value);

    if (
      selectedOperation !== "22" &&
      selectedOperation !== "7" &&
      value &&
      !containerRegex.test(value)
    ) {
      setContainerError("Container number must be in format: ABCD1234567");
    } else {
      setContainerError("");
    }
  };

  const validateContainerNumber = () => {
    if (!selectedOperation) {
      setContainerError("Please select an operation.");
      return false;
    }

    if (selectedOperation !== "22" && containerNumber.trim() === "") {
      setContainerError("Please enter a container number.");
      return false;
    }

    if (
      selectedOperation !== "22" &&
      selectedOperation !== "7" &&
      !containerRegex.test(containerNumber)
    ) {
      setContainerError(
        "Invalid container number. Format should be ABCD1234567"
      );
      return false;
    }

    setContainerError("");
    return true;
  };

  const navigateToCreate = () =>
    navigate(`${process.env.PUBLIC_URL}/app/container-create/${layoutURL}`, {
      state: { containerNumber, operation: selectedOperation },
    });

  const handleGoClick = async () => {
    if (allotmentType == "icd-stuffing") {
      if (selectedOperation != "6" && selectedOperation != "9") {
        toast.error("This container is not valid for this operation");
        return;
      }
    }

    //Check for Gate Out
    if (selectedOperation === "11") {
      if (allotmentType == "icd-stuffing") {
        toast.error("This operation is not valid for Gate Out");
        return;
      }
    }

    // Check Dispatch conditions first
    if (selectedOperation == "15") {
      let res;
      const lastOp = Number(localStorage.getItem("operation"));

      if (!lastOp) {
        toast.error("No operation has been performed yet for this container.");
        return;
      }

      if ([8, 24, 6].includes(lastOp)) {
        // Container is considered loaded – allowed
      } else if (lastOp === 20) {
        // Container is considered empty – allowed
      } else {
        // Neither loaded nor empty valid operations
        toast.error(
          "Please do the entry of Factory or ICD or Stuffing Lcl (for loaded) or Allotment ER (for empty) operation for this container"
        );
        return;
      }
    }

    if (!validateContainerNumber()) return;

    if (
      ["3", "4", "5"].includes(selectedOperation) &&
      arrivalLoadStatus === "empty"
    ) {
      toast.error("Cannot perform this operation. Container is empty.");
      return;
    }

    const fetchAndNavigate = async (routePath) => {
      try {
        const response = await dispatch(
          fetchContainerByNumber(containerNumber)
        );
        const containerExists = response?.payload?.id;

        if (containerExists) {
          let res, arrivalRes, destuffRequestLcl;

          if (selectedOperation === "1") {
            res = await dispatch(getPrefillData(containerNumber));
          }
          if (selectedOperation == "2") {
            arrivalRes = await dispatch(arrivalContainer(containerNumber));
          }

          if (selectedOperation === "5") {
            destuffRequestLcl = await containerService.destuffRequestContainer(
              containerNumber,
              2
            );
          }
          // if (selectedOperation == "6") {
          //   icdStuffing = await operationService.getICDStuffingDetails(
          //     containerNumber
          //   );
          // }
          // if (selectedOperation == "8") {
          //   factoryStuffing = await operationService.getFactoryStuffingDetails(
          //     containerNumber
          //   );
          // }
          // if (selectedOperation == "19") {
          //   allotmentStuffing =
          //     await operationService.allotmentStuffingDetailsByContainerNo(
          //       containerNumber
          //     );
          // }
          // if (selectedOperation == "9") {
          //   stuffingLcl = await operationService.getStuffingLCLProceedDetail(
          //     containerNumber
          //   );
          //   console.log(stuffingLcl);
          // }

          if (selectedOperation === "4") {
            destuffRequestLcl = await containerService.destuffRequestContainer(
              containerNumber,
              1
            );
          }

          if (selectedOperation === "3") {
            destuffRequestLcl = await containerService.destuffFCLExist(
              containerNumber
            );
          }
          console.log("Payload::", res);
          if (selectedOperation === "1" && res?.payload?.id) {
            toast.error("Container already Exist for this Operation");
          } else if (
            selectedOperation === "2" &&
            arrivalRes?.payload?.success
          ) {
            setIsValidContainer(1);
            toast.error("Container already Exist for this Operation");
          } else if (
            selectedOperation === "5" &&
            destuffRequestLcl?.success &&
            destuffRequestLcl?.data?.type == 2
          ) {
            setIsValidContainer(1);
            setIsDestuffRequest(true);
            toast.error("Container already Exist for this Operation");
          } else if (
            selectedOperation === "4" &&
            destuffRequestLcl?.success &&
            destuffRequestLcl?.data?.type == 1
          ) {
            setIsValidContainer(1);
            toast.error("Container already Exist for this Operation");
          } else if (selectedOperation === "3" && destuffRequestLcl?.success) {
            setIsValidContainer(1);
            toast.error("Container already Exist for this Operation");
          }
          // else if (selectedOperation === "6" && icdStuffing?.success) {
          //   setIsValidContainer(1);
          //   toast.error("Container already Exist for this Operation");
          // }
          // else if (selectedOperation === "8" && factoryStuffing?.success) {
          //   setIsValidContainer(1);
          //   toast.error("Container already Exist for this Operation");
          // } else if (selectedOperation === "9" && stuffingLcl?.success) {
          //   setIsValidContainer(1);
          //   toast.error("Container already Exist for this Operation");
          // } else if (selectedOperation === "19" && allotmentStuffing?.success) {
          //   setIsValidContainer(1);
          //   toast.error("Container already Exist for this Operation");
          // }
          else {
            navigate(
              `${process.env.PUBLIC_URL}${routePath}/${response.payload.container_number}/${layoutURL}`,
              {
                state: {
                  containerNumber: response.payload.container_number,
                  operation: selectedOperation,
                },
              }
            );
          }
        } else {
          if (isValidContainer === 0) {
            const validationRes = await dispatch(
              checkValidContainer(containerNumber)
            );
            if (validationRes?.payload?.isValid === false) {
              setContainerError(
                "This container no is not valid, please try again else click on go button"
              );
              setIsValidContainer(isValidContainer + 1);
              return;
            }
          }
          setIsValidContainer(0);
          navigateToCreate();
        }
      } catch (error) {
        console.error("Error in fetchAndNavigate:", error);
      }
    };

    // Get path and navigate
    const operationRoutes = {
      1: "/app/expected-arrival-container",
      2: "/app/arrival-container",
      3: "/app/destuff-fcl-container",
      4: "/app/destuff-lcl-container",
      5: "/app/destuffing-lcl-request",
      6: "/app/icd-stuffing",
      7: "/app/carting-lcl-container",
      8: "/app/factory-stuffing",
      9: "/app/stuffing-lcl",
      10: "/app/gate-in-container",
      11: "/app/gate-out-container",
      12: "/app/seven-point-checklist",
      13: "/app/soc-inspection",
      14: "/app/empty-container-inspection",
      15: "/app/dispatch-container",
      17: "/app/off-hire",
      18: "/app/on-hire-survey",
      19: "/app/allotment-stuffing",
      20: "/app/allotment-er",
      21: "/app/de-allotment",
      22: "/app/measurement-details",
      23: "/app/on-hire",
    };

    const directRoutes = ["3", "4", "5", "7", "8", "22", "9"];
    let shouldNavigate = true;

    const allOperationsWithCheck = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "17",
      "18",
      "19",
      "20",
      "21",
      "23",
    ];

    if (allOperationsWithCheck.includes(selectedOperation)) {
      if (["3", "4", "5"].includes(selectedOperation)) {
        try {
          await axios.get(
            `${API_URL}/destuffFclContainers/check-eligible-destuff/${containerNumber}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        } catch (error) {
          const message =
            error?.response?.data?.message ||
            error?.response?.statusText ||
            "Something went wrong";
          // toast.error(message);
          shouldNavigate = false;
        }
      }

      // Skip navigate if check failed
      if (shouldNavigate) {
        if (
          selectedOperation == "6" &&
          lastOperation == "2" &&
          arrivalLoadStatus != "empty"
        ) {
          toast.error("This container is not valid for ICD Stuffing");
          return;
        }

        if (
          selectedOperation === "8" &&
          allotmentType == "factory-stuffing" &&
          lastOperation != "10"
        ) {
          toast.error("First do the entry of Gate In Operation");
          return;
        }

        await fetchAndNavigate(operationRoutes[selectedOperation]);
      }
    } else if (directRoutes.includes(selectedOperation)) {
      navigate(
        `${process.env.PUBLIC_URL}${operationRoutes[selectedOperation]}/${layoutURL}`,
        {
          state: { containerNumber, operation: selectedOperation },
        }
      );
    } else {
      navigateToCreate();
    }
  };

  return (
    <Fragment>
      <Breadcrumbs mainTitle="Operation" parent="Apps" title="Operation" />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Row className="justify-content-center">
          <Col sm="12" md="6">
            <Card className="shadow-lg p-4">
              <CardBody>
                <h2 className="text-center mb-3">Operation</h2>
                <Form>
                  <FormGroup>
                    <Label>Select Operation</Label>
                    <Input
                      type="select"
                      onChange={handleOperationChange}
                      value={selectedOperation}
                    >
                      <option value="">Select Operation</option>
                      <option value="1">Expected Arrival</option>
                      <option value="2">Arrival</option>
                      <option value="3">Destuffing FCL</option>
                      <option value="4">Destuffing LCL</option>
                      <option value="5">Destuffing LCL Request</option>
                      <option value="6">ICD Stuffing</option>
                      <option value="7">Carting LCL</option>
                      <option value="8">Factory Stuffing</option>
                      <option value="9">Stuffing LCL</option>
                      <option value="10">Gate In</option>
                      <option value="11">Gate Out</option>
                      <option value="12">7 Point Check List</option>
                      <option value="13">SOC Inspection</option>
                      <option value="14">Empty Container Inspection</option>
                      <option value="15">Dispatch</option>
                      <option value="17">Off Hire</option>
                      <option value="23">On Hire</option>
                      <option value="18">On Hire Survey</option>
                      <option value="19">Allotment Stuffing</option>
                      <option value="20">Allotment E.R</option>
                      <option value="21">De-Allotment</option>
                      <option value="22">Measurement</option>
                    </Input>
                  </FormGroup>
                  {selectedOperation !== "22" && (
                    <FormGroup>
                      <Label>Container Number</Label>
                      <Input
                        type="text"
                        placeholder="Container Number"
                        value={containerNumber}
                        onChange={handleContainerChange}
                        readOnly={selectedOperation === "7"}
                        maxLength={11}
                      />
                      {containerError && (
                        <span
                          className="mt-3"
                          style={{ color: "red", fontSize: "0.875rem" }}
                        >
                          {containerError}
                        </span>
                      )}
                    </FormGroup>
                  )}
                  <Button color="primary" block onClick={handleGoClick}>
                    Go
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Operation;
