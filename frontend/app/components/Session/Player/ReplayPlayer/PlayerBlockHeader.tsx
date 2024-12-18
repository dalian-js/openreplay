import { useStore } from "App/mstore";
import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  sessions as sessionsRoute,
  liveSession as liveSessionRoute,
  withSiteId,
} from 'App/routes';
import { BackLink, Link } from 'UI';
import cn from 'classnames';
import SessionMetaList from 'Shared/SessionItem/SessionMetaList';
import UserCard from './EventsBlock/UserCard';
import Tabs from 'Components/Session/Tabs';
import { PlayerContext } from 'App/components/Session/playerContext';
import { observer } from 'mobx-react-lite';
import stl from './playerBlockHeader.module.css';
import { IFRAME } from 'App/constants/storageKeys';

const SESSIONS_ROUTE = sessionsRoute();

function PlayerBlockHeader(props: any) {
  const [hideBack, setHideBack] = React.useState(false);
  const { player, store } = React.useContext(PlayerContext);
  const { uxtestingStore, customFieldStore, projectsStore, sessionStore } = useStore()
  const session = sessionStore.current;
  const sessionPath = sessionStore.sessionPath;
  const siteId = projectsStore.siteId!;
  const playerState = store?.get?.() || { width: 0, height: 0, showEvents: false }
  const { width = 0, height = 0, showEvents = false } = playerState
  const metaList = customFieldStore.list.map((i: any) => i.key)

  const {
    fullscreen,
    closedLive = false,
    setActiveTab,
    activeTab,
    history,
  } = props;

  React.useEffect(() => {
    const iframe = localStorage.getItem(IFRAME) || false;
    setHideBack(!!iframe && iframe === 'true');

    if (metaList.length === 0) customFieldStore.fetchList();
  }, []);

  const backHandler = () => {
    if (
      sessionPath.pathname === history.location.pathname ||
      sessionPath.pathname.includes('/session/') || sessionPath.pathname.includes('/assist/')
    ) {
      history.push(withSiteId(SESSIONS_ROUTE, siteId));
    } else {
      history.push(
        sessionPath ? sessionPath.pathname + sessionPath.search : withSiteId(SESSIONS_ROUTE, siteId)
      );
    }
  };

  const { sessionId, live, metadata } = session;
  let _metaList = Object.keys(metadata || {})
    .filter((i) => metaList.includes(i))
    .map((key) => {
      const value = metadata[key];
      return { label: key, value };
    });

  const TABS = Object.keys(props.tabs).map((tab) => ({
    text: props.tabs[tab],
    key: tab,
  }));


  return (
    <div className={cn(stl.header, 'flex justify-between', { hidden: fullscreen })}>
      <div className="flex w-full items-center">
        {!hideBack && (
          <div
            className="flex items-center h-full cursor-pointer group"
            onClick={backHandler}
          >
                {/* @ts-ignore TODO */}
                <BackLink label="Back" className="h-full ml-2" />
                <div className={stl.divider} />
          </div>
        )}
        <UserCard width={width} height={height} />

        <div className={cn('ml-auto flex items-center h-full', { hidden: closedLive })}>
          {live && !hideBack && !uxtestingStore.isUxt() && (
            <>
              <div className={cn(stl.liveSwitchButton, 'pr-4')}>
                <Link to={withSiteId(liveSessionRoute(sessionId), siteId)}>
                  This Session is Now Continuing Live
                </Link>
              </div>
              {_metaList.length > 0 && <div className={stl.divider} />}
            </>
          )}

          {_metaList.length > 0 && (
            <div className="border-l border-l-gray-lighter h-full flex items-center px-2">
              <SessionMetaList className="" metaList={_metaList} maxLength={2} />
            </div>
          )}
        </div>
      </div>
        <div className="relative border-l border-l-gray-lighter" style={{ minWidth: '270px' }}>
          <Tabs
            tabs={TABS}
            active={activeTab}
            onClick={(tab) => {
              if (activeTab === tab) {
                setActiveTab('');
                player.toggleEvents();
              } else {
                setActiveTab(tab);
                !showEvents && player.toggleEvents();
              }
            }}
            border={false}
          />
        </div>
    </div>
  );
}

const PlayerHeaderCont = observer(PlayerBlockHeader);

export default withRouter(PlayerHeaderCont);
