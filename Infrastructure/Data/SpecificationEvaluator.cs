﻿using Microsoft.EntityFrameworkCore;
using Core.Interfaces;
using Core.Entities;

namespace Infrastructure.Data;

public static class SpecificationEvaluator<T> where T : BaseEntity
{
    public static IQueryable<T> GetQuery(IQueryable<T> query, ISpecification<T> specification)
    {
        if (specification.Criteria != null)
        {
            query = query.Where(specification.Criteria);
        }

        if (specification.OrderBy != null)
        {
            query = query.OrderBy(specification.OrderBy);
        }

        if (specification.OrderByDescending != null)
        {
            query = query.OrderByDescending(specification.OrderByDescending);
        }

        if (specification.IsPagingEnabled)
        {
            query = query.Skip(specification.Skip).Take(specification.Take);
        }

        query = specification.Include.Aggregate(query, (current, include) =>
            current.Include(include));

        query = specification.IncludeStrings.Aggregate(query, (current, include) =>
            current.Include(include));

        return query;
    }

    public static IQueryable<TResult> GetQuery<TSpec, TResult>(IQueryable<T> query, ISpecification<T, TResult> specification)
    {
        var selectQuery = GetQuery(query, specification) as IQueryable<TResult>;

        if (specification.Select != null)
        {
            selectQuery = query.Select(specification.Select);
        }

        if (specification.IsDistinct)
        {
            selectQuery = selectQuery?.Distinct();
        }

        return selectQuery ?? query.Cast<TResult>();
    }
}