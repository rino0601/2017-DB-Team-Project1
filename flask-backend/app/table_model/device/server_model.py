# 서버
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy.orm import relationship

from app.table_model.device.device_model import DeviceModel
from app.table_model.device.spec.server_spec_model import ServerSpecModel
from app.table_model.location.detail_location_model import DetailLocationModel


class ServerModel(DeviceModel):
    __tablename__ = "server"
    id = Column(Integer, ForeignKey(DeviceModel.id), primary_key=True)
    device = relationship('DeviceModel')
    spec_id = Column(Integer, ForeignKey(ServerSpecModel.id))
    spec = relationship('ServerSpecModel')
    location_id = Column(Integer, ForeignKey(DetailLocationModel.id))
    location = relationship('DetailLocationModel', backref='server')
    size = Column(Integer)
    core_num = Column(Integer)
    on = Column(Boolean)
