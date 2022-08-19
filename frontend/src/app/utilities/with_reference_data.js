import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import ROUTES_VEHICLES from '../routes/Vehicles';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function withReferenceData(WrappedComponent) {
  return () => {
    const ReferenceDataSupport = (props) => {
      const [loading, setLoading] = useState(true);
      const [referenceData, setReferenceData] = useState({
        years: []
      });

      useEffect(() => {
        setLoading(true);

        axios.get(ROUTES_VEHICLES.YEARS).then((response) => {
          setReferenceData({
            years: response.data
          });
          setLoading(false);
        });
      }, []);

      if (loading) {
        return <Loading />;
      }
      return <WrappedComponent referenceData={referenceData} {...props} />;
    };

    ReferenceDataSupport.displayName = `ReferenceDataSupport(${getDisplayName(
      WrappedComponent
    )})`;

    return ReferenceDataSupport;
  };
}

export default withReferenceData;
