import React, { useState } from 'react';
import './App.scss';

import cn from 'classnames';
import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

function getFilteredProducts(
  products, query, selectedUserId, selectedCategory,
) {
  let filteredProducts = [...products];

  if (!query && !selectedUserId && selectedCategory.length === 0) {
    return filteredProducts;
  }

  if (query) {
    filteredProducts = filteredProducts.filter((product) => {
      const productName = product.name.toLowerCase();
      const queryLowerCase = query.toLowerCase();

      return productName.includes(queryLowerCase);
    });
  }

  if (selectedCategory.length > 0) {
    filteredProducts = filteredProducts.filter(
      product => selectedCategory.includes(product.category.title),

    );
  }

  if (selectedUserId) {
    filteredProducts = filteredProducts.filter(
      product => product.user.id === selectedUserId,
    );
  }

  return filteredProducts;
}

export const App = () => {
  const products = productsFromServer.map((product) => {
    const category = categoriesFromServer.find(
      _category => _category.id === product.categoryId,
    );
    const user = usersFromServer.find(_user => _user.id === category.ownerId);

    return {
      ...product,
      category,
      user,
    };
  });

  const [query, setQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState([]);

  const visibleProducts = getFilteredProducts(
    products, query.trim(), selectedUserId, selectedCategory,
  );

  const onResetAllFilters = () => {
    setQuery('');
    setSelectedUserId(null);
    setSelectedCategory([]);
  };

  const onCategoryClick = (category) => {
    if (selectedCategory.includes(category)) {
      setSelectedCategory(currentCategory => currentCategory.filter(
        current => current !== category,
      ));
    } else {
      setSelectedCategory(currentCategory => [...currentCategory, category]);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({
                  'is-active': !selectedUserId,
                })}
                onClick={() => setSelectedUserId(null)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href={`#/${user.id}`}
                  className={cn({
                    'is-active': user.id === selectedUserId,
                  })}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                { query.trim() && (
                <span className="icon is-right">
                  <button
                    data-cy="ClearButton"
                    type="button"
                    className="delete"
                    onClick={() => setQuery('')}
                  />
                </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={
                  cn('button is-success mr-6 ',
                    { 'is-outlined': selectedCategory.length > 0 })
                }
                onClick={() => setSelectedCategory([])}
              >
                All
              </a>

              { categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1',
                    { 'is-info': selectedCategory.includes(category.title) })
                  }
                  href={`#/${category.title}`}
                  onClick={() => onCategoryClick(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={onResetAllFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {
            visibleProducts.length === 0 && (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
            )
          }

          { visibleProducts.length > 0 && (
          <table
            data-cy="ProductTable"
            className="table is-striped is-narrow is-fullwidth"
          >
            <thead>
              <tr>
                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    ID

                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort" />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Product

                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort-down" />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Category

                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort-up" />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    User

                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort" />
                      </span>
                    </a>
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleProducts.map(product => (
                <tr key={product.id} data-cy="Product">
                  <td className="has-text-weight-bold" data-cy="ProductId">
                    {product.id}
                  </td>

                  <td data-cy="ProductName">{ product.name}</td>
                  <td data-cy="ProductCategory">
                    {
                    `${product.category.icon} - ${product.category.title}`
                  }
                  </td>

                  <td
                    data-cy="ProductUser"
                    className={cn({
                      'has-text-danger': product.user.sex === 'f',
                      'has-text-link': product.user.sex === 'm',
                    })}
                  >
                    {product.user.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};
