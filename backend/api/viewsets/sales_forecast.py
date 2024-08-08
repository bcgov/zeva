from rest_framework import viewsets
from api.paginations import BasicPagination


class SalesForecastViewset(viewsets.GenericViewSet):
    pagination_class = BasicPagination

    def save(self, request):
        pass
        """
        associated with a POST request with url structure /forecasts/{myr_id};
        expects a payload with the following structure:
        {
            "forecast_records": [
                    Objects with fields in sales_forecast_record.py. (except for sales_forecast)
                    No field shall be non-primitive (e.g. the zev_class field will have a string value of A or B)
                ]
            ice_vehicles_1: an int
            ice_vehicles_2: an int
            ice_vehicles_3: an int
            zev_vehicles_1: an int
            zev_vehicles_2: an int
            zev_vehicles_3: an int
        }
        This method will delete (mark as non-active) any active sales_forecast associated with the myr,
        and create a new active sales_forecast (along with new sales_forecast_record records) using the payload
        """

    def list(self, request, pk=None):
        pass
        """
        associated with a GET request with url structure /forecasts/{myr_id}?page={page number}&size={page size}
        returns an empty response {} if no active sales_forecast associated with the myr
        otherwise, returns a response with the following structure:
        {
            "count": an int with total number of sales forecast records
            "forecast_records": [
                    Objects with fields in sales_forecast_record.py. (except for sales_forecast)
                    No field will be non-primitive (e.g. the zev_class field will have a string value of A or B)
                ]
        }
        """

    def forecast_totals(self, request, pk=None):
        pass
        """
        associated with a GET request with url structure /forecast_totals/{myr_id}
        returns an empty response {} if no active sales_forecast associated with the myr
        otherwise, returns a response with the following structure:
        {
            ice_vehicles_1: an int
            ice_vehicles_2: an int
            ice_vehicles_3: an int
            zev_vehicles_1: an int
            zev_vehicles_2: an int
            zev_vehicles_3: an int
        }
        """