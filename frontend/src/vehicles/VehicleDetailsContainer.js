/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import history from "../app/History";
import ROUTES_VEHICLES from "../app/routes/Vehicles";
import CustomPropTypes from "../app/utilities/props";
import VehicleDetailsPage from "./components/VehicleDetailsPage";

const VehicleDetailsContainer = (props) => {
  const [vehicle, setVehicle] = useState({});
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({
    vehicleComment: { request: "", reject: "" },
  });
  const { id } = useParams();
  const { keycloak, user, location } = props;
  const { state: locationState } = location;

  const stateChange = (newState) => {
    setLoading(true);
    axios
      .patch(`vehicles/${id}/state_change`, { validationStatus: newState })
      .then(() => {
        history.push(ROUTES_VEHICLES.LIST);

        if (newState === "SUBMITTED") {
          history.replace(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id));
        }

        setLoading(false);
      });
  };

  const postComment = (newState) => {
    setLoading(true);
    const { request, reject } = comments.vehicleComment;
    const commentToSend = request || reject;
    const transformedComments = {
      vehicleComment: {
        comment: commentToSend,
      },
    };
    axios
      .patch(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id), transformedComments)
      .then(() => {
        stateChange(newState);
      })
      .catch((error) => {
        console.error("Error posting comments:", error);
      });
  };

  const refreshList = () => {
    setLoading(true);
    axios.get(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id)).then((response) => {
      setVehicle(response.data);
      setLoading(false);
    });
  };

  const isActiveChange = (isActive) => {
    axios.patch(`vehicles/${id}/is_active_change`, { isActive }).then(() => {
      refreshList();
    });
  };

  useEffect(() => {
    refreshList();
  }, [keycloak.authenticated]);

  return (
    <VehicleDetailsPage
      locationState={locationState}
      comments={comments}
      details={vehicle}
      loading={loading}
      postComment={postComment}
      requestStateChange={stateChange}
      setComments={setComments}
      user={user}
      isActiveChange={isActiveChange}
    />
  );
};

VehicleDetailsContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
  location: PropTypes.shape().isRequired,
};

export default withRouter(VehicleDetailsContainer);
