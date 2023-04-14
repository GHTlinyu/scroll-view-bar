import React, { useMemo, useState } from 'react';
import DefaultLongView from './DefaultLongView';
import DefaultView from './DefaultView';
import DefaultWithOutScrollBar from './DefaultWithOutScrollBar';

const Default = () => {
  const [used, setUsed] = useState(false);
  const [useLongView, setUseLongView] = useState(false);
  const node = useMemo(() => {
    if (used) {
      if (useLongView) {
        return <DefaultLongView />;
      } else {
        return <DefaultView />;
      }
    } else {
      return <DefaultWithOutScrollBar />;
    }
  }, [used, useLongView]);
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <span>
          是否激活：
          <span
            style={{
              width: 70,
              borderRadius: 7,
              cursor: 'pointer',
              background: '#d2cfcb',
              textAlign: 'center',
              display: 'inline-block',
              boxShadow: used ? '0 2px 4px #666' : 'none',
            }}
            onClick={() => {
              setUsed((pre) => !pre);
            }}
          >
            {used ? '是' : '否'}
          </span>
        </span>
        {used ? (
          <>
            <span
              style={{
                width: 80,
                borderRadius: 7,
                cursor: 'pointer',
                background: '#d2cfcb',
                textAlign: 'center',
                display: 'inline-block',
                marginLeft: 7,
                boxShadow: !useLongView ? '0 2px 4px #666' : 'none',
              }}
              onClick={() => {
                setUseLongView(false);
              }}
            >
              正常内容
            </span>
            <span
              style={{
                width: 80,
                borderRadius: 7,
                cursor: 'pointer',
                background: '#d2cfcb',
                textAlign: 'center',
                display: 'inline-block',
                marginLeft: 7,
                boxShadow: useLongView ? '0 2px 4px #666' : 'none',
              }}
              onClick={() => {
                setUseLongView(true);
              }}
            >
              内容过长
            </span>
          </>
        ) : (
          ''
        )}
      </div>

      <div>{node}</div>
    </div>
  );
};

export default Default;
