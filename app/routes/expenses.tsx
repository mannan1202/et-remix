import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { getUser } from '~/utils/session.server';

//TODO
//https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
//https://www.npmjs.com/package/zod

export const loader = async ({ request }: LoaderArgs) => {
  const expensesList = await db.expenses.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, amount: true },
  });
  const user = await getUser(request);
  return json({ expensesList, user });
};

export default function Expenses() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      {data.user ? (
        <div className="text-blue-500">
          <span>{`Hi ${data.user.username}`}</span>
          <Form action="/logout" method="post">
            <button type="submit" className="button">
              Logout
            </button>
          </Form>
        </div>
      ) : (
        <Link to="/login">Login</Link>
      )}
      <h1>Expenses</h1>
      <main>
        <ul>
          {data.expensesList.map(({ id, title, amount }) => (
            <li key={id}>
              <Link prefetch="intent" to={id}>
                {title} - {amount}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="create" className="button">
          Add Expense
        </Link>
        <Outlet />
      </main>
    </div>
  );
}
