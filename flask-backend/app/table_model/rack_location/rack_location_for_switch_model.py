from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer

from orm.session import Base
from table_model.rack_location.device_info import DeviceInfo
from table_model.rack_location.for_switch_model import DeviceInfoForSwitchModel
from table_model.rack_location.rack_location_model import RackLocationModel


class RackLocationForSwitchModel(RackLocationModel):
    __tablename__ = "rack_location_for_switch"
    id = Column(Integer, ForeignKey(RackLocationModel.id), primary_key=True, autoincrement=True)
    device_info_id = Column(Integer, ForeignKey(DeviceInfoForSwitchModel.id))
