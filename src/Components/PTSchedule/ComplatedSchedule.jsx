import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { H5, H6, Image, LI, UL, P } from "../../AbstractElements";
import SvgIcon from "../Common/Component/SvgIcon";

const CompletedSchedule = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as needed

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const convertedTime = (time) => {
    return new Date(`2025-01-01T${time}`).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  };

  return (
    <Card className="schedule-card">
      <CardHeader className="card-no-border">
        <div className="header-top">
          <H5 attrH5={{ className: "m-0" }}>Completed Schedule</H5>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <UL attrUL={{ className: "schedule-list d-flex" }}>
          {paginatedData.map((item, i) => (
            <LI key={i} attrLI={{ className: `warning` }}>
              <div>
                <H6 className="mb-0">{item.trainer_name}</H6>
                <P className="mb-1">
                  {item.user_name} ({item.user_email})
                </P>
                <UL>
                  <LI attrLI={{ className: "f-light" }}>
                    <SvgIcon iconId={"bag"} className="fill-icon f-light" />
                    <span>
                      {new Date(item.booking_date).toLocaleDateString("en-CA")}
                    </span>
                  </LI>
                  <LI attrLI={{ className: "f-light" }}>
                    <SvgIcon iconId={"clock"} className="fill-icon f-success" />
                    <span>
                      {convertedTime(item.start_time)} - {convertedTime(item.end_time)}
                    </span>
                  </LI>
                </UL>
              </div>
            </LI>
          ))}
        </UL>

        {/* Pagination */}
        <Pagination
          aria-label="Page navigation example"
          className="pagination-primary d-flex justify-content-center mt-2"
        >
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink
              previous
              onClick={() => handlePageChange(currentPage - 1)}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index} active={currentPage === index + 1}>
              <PaginationLink onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink
              next
              onClick={() => handlePageChange(currentPage + 1)}
            />
          </PaginationItem>
        </Pagination>
      </CardBody>
    </Card>
  );
};

export default CompletedSchedule;
