import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import {
  Form,
  Link,
  isRouteErrorResponse,
  useActionData,
  useRouteError,
} from '@remix-run/react';

import { db } from '~/utils/db.server';
import { badRequest } from '~/utils/request.server';

import { getUserId, requireUserId } from '~/utils/session.server';

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return json({});
};

const validateExpenseTitle = (title: string) => {
  if (title.length === 0) {
    return 'title is required';
  }
};

const validateExpenseCategory = (category: string) => {
  if (category.length === 0) {
    return 'category is required';
  }
};

const valieExpensePaidBy = (paidby: string) => {
  if (paidby.length === 0) {
    return 'paid by is required';
  }
};

const valieExpenseAmount = (amount: Number) => {
  if (amount !== null || amount !== 0) {
    return 'amount can not be zero';
  }
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const form = await request.formData();

  const title = form.get('title');
  const category = form.get('category');
  const paid_by = form.get('paidby');
  const amount = Number(form.get('amount'));

  if (
    typeof title !== 'string' ||
    typeof category !== 'string' ||
    typeof paid_by !== 'string' ||
    typeof amount !== 'number'
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: 'Form not submitted correctly.',
    });
  }
  const fieldErrors = {
    title: validateExpenseTitle(title),
    category: validateExpenseCategory(category),
    paid_by: valieExpensePaidBy(paid_by),
    amount: valieExpenseAmount(amount),
  };
  const fields = {
    title,
    category,
    paid_by,
    amount,
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const expense = await db.expenses.create({
    data: { ...fields, userId },
  });
  return redirect(`/expenses/${expense.id}`);
};

export default function NewExpenseRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <p>Add your own expense</p>
      <Form method="post">
        <div>
          <label>
            Title:{' '}
            <input
              type="text"
              name="title"
              defaultValue={actionData?.fields?.title}
              aria-invalid={Boolean(actionData?.fieldErrors?.title)}
              aria-errormessage={
                actionData?.fieldErrors?.title
                  ? 'title-error'
                  : undefined
              }
            />
            {actionData?.fieldErrors?.title ? (
              <p
                className="text-red-500"
                id="title-error"
                role="alert"
              >
                {actionData.fieldErrors.title}
              </p>
            ) : null}
          </label>
        </div>
        <div>
          <label>
            Category:{' '}
            <input
              type="text"
              name="category"
              defaultValue={actionData?.fields?.category}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.category
              )}
              aria-errormessage={
                actionData?.fieldErrors?.category
                  ? 'category-error'
                  : undefined
              }
            />
            {actionData?.fieldErrors?.category ? (
              <p
                className="text-red-500"
                id="category-error"
                role="alert"
              >
                {actionData.fieldErrors.category}
              </p>
            ) : null}
          </label>
        </div>
        <div>
          <label>
            Paid By:{' '}
            <input
              type="text"
              name="paidby"
              defaultValue={actionData?.fields?.paid_by}
              aria-invalid={Boolean(actionData?.fieldErrors?.paid_by)}
              aria-errormessage={
                actionData?.fieldErrors?.paid_by
                  ? 'paid_by-error'
                  : undefined
              }
            />
            {actionData?.fieldErrors?.paid_by ? (
              <p
                className="text-red-500"
                id="paid_by-error"
                role="alert"
              >
                {actionData.fieldErrors.paid_by}
              </p>
            ) : null}
          </label>
        </div>
        <div>
          <label>
            Amount:{' '}
            <input
              type="number"
              name="amount"
              defaultValue={actionData?.fields?.amount}
              aria-invalid={Boolean(actionData?.fieldErrors?.amount)}
              aria-errormessage={
                actionData?.fieldErrors?.amount
                  ? 'amount-error'
                  : undefined
              }
            />
            {actionData?.fieldErrors?.amount ? (
              <p
                className="text-red-500"
                id="amount-error"
                role="alert"
              >
                {actionData.fieldErrors.amount}
              </p>
            ) : null}
          </label>
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <div className="text-red-500">
        <p>You must be logged in to add a expense.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  return (
    <div className="text-red-500">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
