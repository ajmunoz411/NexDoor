import React, { useState } from 'react';
import { Container, Grid, Avatar } from '@material-ui/core';
import { Button, Modal, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
// import axios from 'axios';
// import Ratings from 'react-ratings-declarative';
// import StarIcon from '@material-ui/icons/Star';
// import styled from 'styled-components';
// import ActiveModal from './ActiveModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../../Header';
import Sidebar from '../../Sidebar';
import YourHelper from './YourHelper';
import Chat from '../../Chat/Chat';

const MyActiveRequest = () => (
  <Container style={{ maxHeight: '100%' }}>
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
        // alignItems="flex-start"
        style={{ fontStyle: 'Roboto', height: '100%' }}
      >
        <Chat />
      </Grid>
      <Grid
        direction="column"
        justifyContent="flex-end"
        // alignItems="flex-start"
        style={{ fontStyle: 'Roboto', height: '100%' }}
      >
        <YourHelper />
      </Grid>
    </Grid>
  </Container>
);

export default MyActiveRequest;
