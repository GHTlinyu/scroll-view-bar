import React, { useEffect, useState } from 'react';
import ScrollViewBar from 'scroll-view-bar';

const waitTime = (time: number) => {
  return new Promise<{ data: React.ReactNode }>((resolve) => {
    setTimeout(() => {
      resolve({
        data: (
          <div>
            白酒新熟山中归，黄鸡啄黍秋正肥。
            <br />
            呼童烹鸡酌白酒，儿女嬉笑牵人衣。
            <br />
            高歌取醉欲自慰，起舞落日争光辉。
            <br />
            游说万乘苦不早，著鞭跨马涉远道。
            <br />
            会稽愚妇轻买臣，余亦辞家西入秦。
            <br />
            仰天大笑出门去，我辈岂是蓬蒿人。
          </div>
        ),
      });
    }, time);
  });
};

const DelayView = () => {
  const [data, setData] = useState<React.ReactNode>(
    <div>
      大鹏一日同风起，扶摇直上九万里。
      <br />
      假令风歇时下来，犹能簸却沧溟水。
      <br />
      世人见我恒殊调，闻余大言皆冷笑。(闻 一作：见)
      <br />
      宣父犹能畏后生，丈夫未可轻年少。
    </div>,
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await waitTime(3000);
        setData(res.data);
      } catch (error) {
        setData('');
      }
    };
    fetchData();
  }, []);

  return <ScrollViewBar style={{ height: 300 }}>{data}</ScrollViewBar>;
};

export default DelayView;
