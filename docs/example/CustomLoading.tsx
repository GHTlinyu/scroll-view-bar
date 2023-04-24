import React, { useMemo, useState } from 'react';
import ScrollViewBar from 'scroll-view-bar';

const CustomLoading = () => {
  const [trigger, setTrigger] = useState(false);
  const [loading, setLoading] = useState(false);
  const node = useMemo(() => {
    let arr = [];
    for (let i = 0; i < 50; i++) {
      arr.push(
        <div
          key={i}
          style={{
            width: '45%',
            border: 'solid 1px',
            marginTop: 5,
            padding: 12,
            overflow: 'scroll',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <div>title</div>
            <div>extra</div>
          </div>
          <div className="content">
            <div key={0}>
              <p>
                噫吁嚱，危乎高哉！
                <br />
                蜀道之难，难于上青天！
                <br />
                蚕丛及鱼凫，开国何茫然！
                <br />
                尔来四万八千岁，不与秦塞通人烟。
                <br />
                西当太白有鸟道，可以横绝峨眉巅。
                <br />
                地崩山摧壮士死，然后天梯石栈相钩连。
                <br />
                上有六龙回日之高标，下有冲波逆折之回川。
                <br />
                黄鹤之飞尚不得过，猿猱欲度愁攀援。
                <br />
                青泥何盘盘，百步九折萦岩峦。
                <br />
                扪参历井仰胁息，以手抚膺坐长叹。
                <br />
                问君西游何时还？畏途巉岩不可攀。
                <br />
                但见悲鸟号古木，雄飞雌从绕林间。
                <br />
                又闻子规啼夜月，愁空山。
                <br />
                蜀道之难，难于上青天，使人听此凋朱颜！
                <br />
                连峰去天不盈尺，枯松倒挂倚绝壁。
                <br />
                飞湍瀑流争喧豗，砯崖转石万壑雷。
                <br />
                其险也如此，嗟尔远道之人胡为乎来哉！(也如此 一作：也若此)
                <br />
                剑阁峥嵘而崔嵬，一夫当关，万夫莫开。
                <br />
                所守或匪亲，化为狼与豺。
                <br />
                朝避猛虎，夕避长蛇，磨牙吮血，杀人如麻。
                <br />
                锦城虽云乐，不如早还家。
                <br />
                蜀道之难，难于上青天，侧身西望长咨嗟！
              </p>
            </div>
          </div>
        </div>,
      );
    }
    return arr;
  }, []);
  return (
    <>
      <div
        key={'1'}
        style={{
          width: 60,
          textAlign: 'center',
          background: '#d2cfcb',
          marginLeft: 7,
          borderRadius: 7,
          boxShadow: trigger ? '0 3px 4px #666' : 'none',
        }}
        onClick={() => {
          setTrigger((pre) => !pre);
        }}
      >
        {loading ? 'loading' : 'trigger'}
      </div>
      <ScrollViewBar
        style={{ height: 300 }}
        onLoading={(loading) => {
          setLoading(loading);
        }}
        trigger={trigger}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {node}
        </div>
      </ScrollViewBar>
    </>
  );
};

export default CustomLoading;
