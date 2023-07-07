import React, { useState } from 'react';
import './App.scss';

import cn from 'classnames';
import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

function getVisibleProducts(
  products, query, selectedUserId, selectedCategory, sortType, isReversed,
) {
  let visibleProducts = [...products];

  if (query) {
    visibleProducts = visibleProducts.filter((product) => {
      const productName = product.name.toLowerCase();
      const queryLowerCase = query.toLowerCase();

      return productName.includes(queryLowerCase);
    });
  }

  if (selectedCategory.length > 0) {
    visibleProducts = visibleProducts.filter(
      product => selectedCategory.includes(product.category.title),
    );
  }

  if (selectedUserId) {
    visibleProducts = visibleProducts.filter(
      product => product.user.id === selectedUserId,
    );
  }

  /**  Solution with if

  if (sortType === 'ID') {
    visibleProducts = visibleProducts.sort((id1, id2) => id1.id - id2.id);
  }

  if (['Products', 'Category', 'User'].includes(sortType)) {
    visibleProducts = visibleProducts.sort((product1, product2) => {
      const firstValue = product1[sortType]?.title || product1[sortType]?.name;
      const secondValue = product2[sortType]?.title || product2[sortType]?.name;

      return firstValue?.localeCompare(secondValue);
    });
  }
  */

  // Solution with switch
  if (sortType) {
    visibleProducts.sort((prA, prB) => {
      switch (sortType) {
        case 'ID':
          return prA.id - prB.id;

        case 'Product':
          return prA.name.localeCompare(prB.name);

        case 'Category':
          return prA.category.title.localeCompare(prB.category.title);

        case 'User':
          return prA.user.name.localeCompare(prB.user.name);

        default:
          return 0;
      }
    });
  }

  if (isReversed) {
    visibleProducts = visibleProducts.reverse();
  }

  return visibleProducts;
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
  const [sortType, setSortType] = useState('');
  const [isReversed, setIsReversed] = useState(false);

  const visibleProducts = getVisibleProducts(
    products,
    query.trim(),
    selectedUserId,
    selectedCategory,
    sortType,
    isReversed,
  );

  const onResetAllFilters = () => {
    setQuery('');
    setSelectedUserId(null);
    setSelectedCategory([]);
    setSortType('');
    setIsReversed(false);
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

  function sortBy(newSortType) {
    const firstClick = newSortType !== sortType;
    const secondClick = newSortType === sortType && !isReversed;
    const thirdClick = newSortType === sortType && isReversed;

    if (firstClick) {
      setSortType(newSortType);
      setIsReversed(false);

      return;
    }

    if (secondClick) {
      setSortType(newSortType);
      setIsReversed(true);

      return;
    }

    if (thirdClick) {
      setSortType('');
      setIsReversed(false);
    }
  }

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

                    <a
                      href="#/"
                      onClick={() => sortBy('ID')}
                    >
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          // className="fas fa-sort"
                          className={cn('fas', {
                            'fa-sort': sortType !== 'ID',
                            'fa-sort-down': sortType === 'ID' && isReversed,
                            'fa-sort-up': sortType === 'ID' && !isReversed,
                          })}
                        />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Product

                    <a
                      href="#/"
                      onClick={() => sortBy('Products')}
                    >
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className={cn('fas', {
                            'fa-sort': sortType !== 'Products',
                            'fa-sort-down': sortType === 'Products'
                              && isReversed,
                            'fa-sort-up': sortType === 'Products'
                              && !isReversed,
                          })}
                        />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Category

                    <a
                      href="#/"
                      onClick={() => sortBy('Category')}
                    >
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className={cn('fas', {
                            'fa-sort': sortType !== 'Category',
                            'fa-sort-down': sortType === 'Category'
                                && isReversed,
                            'fa-sort-up': sortType === 'Category'
                                && !isReversed,
                          })}

                        />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    User

                    <a
                      href="#/"
                      onClick={() => sortBy('User')}
                    >
                      <span className="icon">
                        <i
                          data-cy="SortIcon"
                          className={cn('fas', {
                            'fa-sort': sortType !== 'User',
                            'fa-sort-down': sortType === 'User'
                                && isReversed,
                            'fa-sort-up': sortType === 'User'
                                && !isReversed,
                          })}
                        />
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
                      'has-text-danger': product.user?.sex === 'f',
                      'has-text-link': product.user?.sex === 'm',
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
