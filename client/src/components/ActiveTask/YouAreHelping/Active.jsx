// import { Button, Modal, Form } from 'react-bootstrap';
// import Ratings from 'react-ratings-declarative';
// import StarIcon from '@material-ui/icons/Star';
// import styled from 'styled-components';
// import MarkFinishModal from './MarkFinishModal';
// import { useSelector } from 'react-redux';
import React from 'react';
import { Container, Grid } from '@material-ui/core';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../../Header';
import Sidebar from '../../Sidebar';
import YouAreHelping from './YouAreHelping';
import Chat from '../../Chat/Chat';

const Active = () => (
  <Container>
    <Header />
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-start"
      style={{ fontStyle: 'Roboto' }}
    >
      <Sidebar />
      <Grid
        direction="column"
        justifyContent="center"
        style={{ fontStyle: 'Roboto' }}
      >
        <Chat />
      </Grid>
      <Grid
        direction="column"
        justifyContent="flex-end"
        style={{ fontStyle: 'Roboto', height: '100%' }}
      >
        <YouAreHelping />
      </Grid>
    </Grid>
  </Container>
);

export default Active;
