# 百度地图中世界地图坐标点

## 参考

> [CSDN - echarts世界地图各个国家及中国城市的经纬度数组](https://blog.csdn.net/xiaozhi_free/article/details/79654529)
>
> [CSDN - echarts世界国家中英文对照](https://blog.csdn.net/u012557538/article/details/78490267)

## 说明

- 基于百度坐标系，具体坐标系的区别，参见 [坐标系说明书](http://lbsyun.baidu.com/index.php?title=coordinate)
- 共计`174`个国家或地区的数据，如有缺失，请自行添加
- 政治相关
    - 国家英文名称，按照`world-map`中`name`字段为准，部分国家为展示，部分缩写
        - 如`Republic` 缩写为`Rep.`
        - `United States of America`改为`United States`
    - 国家英文名称，全称见`world-map`中`formal_en`字段
    - 不涉及政治区域的划分和地区与国家的讨论，及各种纠纷
        - 已删除“中华人民共和国台湾省”数据，需要者自行添加
        - `world-map`中国家，缺少`Côte d'Ivoire`及`Palestine`对应的国家中心点及中英文对照，需要者自行添加
        - 修改部分国家中文名称，如`北朝鲜`改为`朝鲜`

## 目录结构

```tree
.
├── README.md
├── world-country-center.json           # 世界国家中心点，已按照字典序排列
├── world-country-translation.json      # 世界国家中英文对照，已按照字典序排列
├── world-country.json                  # 世界国家信息（已合并其他3个json数据）
├── world-map.json                      # 世界国家原始数据
└── world.js                            # 可直接运行
```
