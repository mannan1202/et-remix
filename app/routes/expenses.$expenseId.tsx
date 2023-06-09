import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';

import {
  Link,
  useLoaderData,
  useParams,
  isRouteErrorResponse,
  useRouteError,
  Form,
} from '@remix-run/react';

import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await getUserId(request);

  const expense = await db.expenses.findUnique({
    where: { id: params.expenseId },
  });
  if (!expense) {
    throw new Response('Expense! Not found.', {
      status: 404,
    });
  }

  return json({ isOwner: userId === expense.userId, expense });
};

export const action = async ({ params, request }: ActionArgs) => {
  const form = await request.formData();
  if (form.get('intent') !== 'delete') {
    throw new Response(
      `The intent ${form.get('intent')} is not supported`,
      { status: 400 }
    );
  }
  const userId = await requireUserId(request);
  const expense = await db.expenses.findUnique({
    where: { id: params.jokeId },
  });
  if (!expense) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  if (expense.userId !== userId) {
    throw new Response("Pssh, nice try. That's not your expense", {
      status: 403,
    });
  }
  await db.expenses.delete({ where: { id: params.expenseId } });
  return redirect('/expenses');
};

export default function ExpenseRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's your expense:</p>
      <p>
        {data.expense.title} - {data.expense.amount} - paid by{' '}
        {data.expense.paid_by} in category {data.expense.category}
      </p>
      <Link to=".">"{data.expense.title}" Permalink</Link>
      {data.isOwner ? (
        <Form method="post">
          <button
            className="button"
            name="intent"
            type="submit"
            value="delete"
          >
            Delete
          </button>
        </Form>
      ) : null}
    </div>
  );
}

export function ErrorBoundary() {
  const { expenseId } = useParams();

  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return (
        <div className="text-red-500">
          What you're trying to do is not allowed.
        </div>
      );
    }
    if (error.status === 403) {
      return (
        <div className="text-red-500">
          Sorry, but "{expenseId}" is not your expense.
        </div>
      );
    }
    if (error.status === 404) {
      return (
        <div className="text-red-500">
          No expense found "{expenseId}"?
        </div>
      );
    }
  }

  return (
    <div className="text-red-500">
      There was an error loading joke by the id "${expenseId}". Sorry.
    </div>
  );
}
