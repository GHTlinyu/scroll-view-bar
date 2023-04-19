import React, { useMemo, useState } from 'react';
import View1 from './View1';
import View2 from './View2';
import View3 from './View3';

const ViewChange = () => {
  const [selected, setSelected] = useState(0);
  const items = useMemo(() => {
    return [0, 1, 2].map((key) => {
      return (
        <div
          key={key}
          style={{
            width: 60,
            textAlign: 'center',
            background: '#d2cfcb',
            marginLeft: 7,
            borderRadius: 7,
            boxShadow: selected === key ? '0 3px 4px #666' : 'none',
          }}
          onClick={() => {
            setSelected(key);
          }}
        >
          btn{key}
        </div>
      );
    });
  }, [selected]);

  const newNode = useMemo(() => {
    switch (selected) {
      case 0:
        return <View1 />;
      case 1:
        return <View2 />;
      case 2:
        return <View3 />;
    }
  }, [selected]);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 7 }}>
        {items}
      </div>
      <div style={{ height: 300 }}>{newNode}</div>
    </div>
  );
};

export default ViewChange;
