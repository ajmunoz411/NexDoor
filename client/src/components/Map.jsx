/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const Map = () => {
  const tasks = useSelector((store) => store.tasksReducer.tasks);
  const [addresses, setAddresses] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const coordinateContainer = [];

  const mapStyles = {
    height: '100%',
    width: '100%',
    borderRadius: '10px',
  };

  const defaultCenter = {
    lat: 34.0522,
    lng: -118.2437,
  };

  const formatCoord = (coord) => {
    let formattedCoord = coord.substring(1, coord.length - 1);
    formattedCoord = formattedCoord.split(',');
    const coordinate = { lat: Number(formattedCoord[1]), lng: Number(formattedCoord[0]) };
    return coordinate;
  };

  useEffect(() => {
    setAddresses(tasks);
  }, [tasks]);

  const iterateAddresses = async () => {
    if (addresses) {
      addresses.forEach((task) => {
        const coor = task.location.coordinate;
        const coordinate = formatCoord(coor);
        coordinateContainer.push(coordinate);
      });
    }
  };

  useEffect(() => {
    iterateAddresses()
      .then(() => {
        setCoordinates(coordinateContainer);
      });
  }, [addresses]);

  if (!tasks) {
    return <></>;
  }
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyAF8YxtZo1Y_VwXnNrmb1ErGpupP1kYniI"
    >
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={13}
        center={defaultCenter}
      >
        {
          coordinates.map((coordinate, i) => (
            <Marker key={i} position={coordinate} />
          ))
        }
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
