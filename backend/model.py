import dataclasses
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Union


# 模型的一些信息
@dataclass
class ModelInfo:
    # 模型id
    id: str
    # 模型名称，显示在前端
    name: str
    # 模型简介，显示在前端
    desc: str
    # 模型参数量
    params: str
    # 模型类型，用于前端显示
    type: str
    # 可调参数
    features: str = ""


# 抽象模型类
class Model(ABC):
    _INFO: ModelInfo = ModelInfo(
        id="MODEL",
        name="ERROR",
        desc="ERROR",
        params="ERROR",
        type="ERROR",
        features="",

    )

    @staticmethod
    @abstractmethod
    def predict(data: Union[dict, str]) -> str:
        """模型预测

        Args:
            data (Union[str]): 传入数据

        Returns:
            str: 预测后数据
        """
        pass

    @classmethod
    def id(cls) -> str:
        return cls._INFO.id

    @classmethod
    def name(cls) -> str:
        return cls._INFO.name

    @classmethod
    def desc(cls) -> str:
        return cls._INFO.desc

    @classmethod
    def params(cls) -> str:
        return cls._INFO.params

    @classmethod
    def to_json(cls):
        """模型相关信息转换为json

        Returns:
            json: 模型相关信息
        """
        return dataclasses.asdict(cls._INFO)
