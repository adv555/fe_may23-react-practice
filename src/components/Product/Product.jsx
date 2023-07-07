import React from 'react';
import cn from 'classnames';

export const Product = (
  { product: { id, name, category, user } },
) => (
  <tr data-cy="Product">
    <td className="has-text-weight-bold" data-cy="ProductId">
      {id}
    </td>

    <td data-cy="ProductName">{name}</td>
    <td data-cy="ProductCategory">
      {`${category.icon} - ${category.title}`}
    </td>

    <td
      data-cy="ProductUser"
      className={cn({
        'has-text-danger': user?.sex === 'f',
        'has-text-link': user?.sex === 'm',
      })}
    >
      {user.name}
    </td>
  </tr>
);
