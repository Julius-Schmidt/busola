import React from 'react';
import { Button } from '@ui5/webcomponents-react';
import { Popover, Menu } from 'fundamental-react';
import './ListActions.scss';

import PropTypes from 'prop-types';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';

const AUTO_ICONS_BY_NAME = new Map([
  ['Edit', 'edit'],
  ['Delete', 'delete'],
  ['Details', 'detail-view'],
]);

const StandaloneAction = ({ action, entry, compact }) => {
  const icon = action.icon || AUTO_ICONS_BY_NAME.get(action.name);

  if (action.component) {
    return action.component(entry);
  }
  const actionButton = (
    <Button
      design="Transparent"
      disabled={action.disabledHandler && action.disabledHandler(entry)}
      icon={typeof icon === 'function' ? icon(entry) : icon}
      onClick={() => action.handler(entry)}
      className="list-actions__standalone"
      aria-label={action.name}
      data-testid={action.name.replace(' ', '').toLowerCase()}
    >
      {icon ? '' : action.name}
    </Button>
  );

  return action.tooltip ? (
    <Tooltip
      className="actions-tooltip"
      content={
        typeof action.tooltip === 'function'
          ? action.tooltip(entry)
          : action.tooltip
      }
    >
      {' '}
      {actionButton}{' '}
    </Tooltip>
  ) : (
    <> {actionButton} </>
  );
};

const ListActions = ({ actions, entry, compact }) => {
  if (!actions.length) {
    return null;
  }

  const listItems = actions.slice(3, actions.length);
  return (
    <div className="list-actions">
      {actions.slice(0, 3).map(a => (
        <StandaloneAction
          key={a.name}
          action={a}
          entry={entry}
          compact={compact}
        />
      ))}
      {listItems.length ? (
        <Popover
          body={
            <Menu>
              <Menu.List>
                {listItems.map(a => (
                  <Menu.Item onClick={() => a.handler(entry)} key={a.name}>
                    {a.name}
                  </Menu.Item>
                ))}
              </Menu.List>
            </Menu>
          }
          control={
            <Button
              design="Transparent"
              icon="vertical-grip"
              aria-label="more-actions"
            />
          }
          placement="bottom-end"
        />
      ) : null}
    </div>
  );
};

ListActions.propTypes = {
  actions: CustomPropTypes.listActions,
  entry: PropTypes.any.isRequired,
  compact: PropTypes.bool,
};

export default ListActions;
