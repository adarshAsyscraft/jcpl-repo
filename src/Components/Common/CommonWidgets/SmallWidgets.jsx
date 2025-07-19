import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { H4 } from "../../../AbstractElements";
import SvgIcon from "../Component/SvgIcon";
import CountUp from "react-countup";
const SmallWidgets = ({ data, mainClass, headClasses , head }) => {

  return (
    <Card className={`small-widget ${mainClass ? mainClass : ""}`}>
     {head ? <CardHeader className={`${headClasses ? headClasses : ""}`}>
        {head}
      </CardHeader>:""}
      <CardBody className={data.color}>
        <span className="f-light">{data.title}</span>
        <div className="d-flex align-items-end gap-1">
          <H4>
            <CountUp
              suffix={data.suffix ? data.suffix : ""}
              prefix={data.prefix ? data.prefix : ""}
              duration={2}
              separator=","
              end={data.total}
            />
          </H4>
         {data.gros? <span className={`font-${data.color} f-12 f-w-500`}>
            <i className={`icon-arrow-${data.move === -1 ? "down" : "up"}`} />
            <span>
              {data.move === -1 ? "-" : "+"}
              {data.gros}%
            </span>
          </span>:""}
        </div>
        <div className="bg-gradient">
          <SvgIcon iconId={data.icon} className="stroke-icon svg-fill" />
        </div>
      </CardBody>
    </Card>
  );
};

export default SmallWidgets;
