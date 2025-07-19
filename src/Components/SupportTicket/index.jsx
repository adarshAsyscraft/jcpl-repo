import { Breadcrumbs, H5 } from '../../AbstractElements';
import TicketList from './TicketList';
import TicketTable from './TicketTable';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import React, { Fragment } from 'react';
import Chart from 'react-apexcharts';


const areaSpaline = {
  series: [{
    name: 'Open',
    data: [31, 40, 28, 51, 42, 109, 100]
  }, {
    name: 'Resolve',
    data: [11, 32, 45, 32, 34, 52, 41]
  }],
  options: {
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ["#40f169", '#ff668e'],
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      type: 'datetime',
      categories: ['2018-09-19T00:00:00.000Z', '2018-09-19T01:30:00.000Z', '2018-09-19T02:30:00.000Z', '2018-09-19T03:30:00.000Z', '2018-09-19T04:30:00.000Z', '2018-09-19T05:30:00.000Z', '2018-09-19T06:30:00.000Z']
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm'
      },
    },
  },

};
const SupportTickitContain = () => {


   const ticketCardData  = [
    {
      id: 1,
      title: 'Total Open Tickets',
      num: '2563',
      class: 'progress-bar bg-primary',
    },
    {
      id: 2,
      title: 'Total Resolve tickets',
      num: '8943',
      class: 'progress-bar bg-secondary',
    },
    {
      id: 3,
      title: 'Escalated Tickets',
      num: '2500',
      class: 'progress-bar bg-warning',
    },
  ];


  return (
    <Fragment>
      <Breadcrumbs mainTitle='Support Ticket' parent='Apps' title='Support Ticket' />
      <Container fluid={true}>
        <Row>
          <Col sm='12'>
            <Card>
              <CardHeader>
                <H5>{'Support Ticket List'}</H5>
                <span>{'List of ticket opend by customers'}</span>
              </CardHeader>
              <CardBody>
                <TicketList data={ticketCardData} />
                <div>
                  <div id='basic-apex'>
                              <Chart options={areaSpaline.options} series={areaSpaline.series} height="350" type="area" />
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <H5>{'Manage & Assign Support Tickets'}</H5>
              </CardHeader>
              <CardBody>
                <TicketTable />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};
export default SupportTickitContain;
