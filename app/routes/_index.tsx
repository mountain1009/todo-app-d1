import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { useSubmit } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { PlusCircle } from "lucide-react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { client } from "~/db/client.server";
import { todos } from "~/db/todos";
import { Env } from "~/types";

export const loader = async ({ context }: LoaderFunctionArgs) => {
	const env = context.env as Env;
	const items = await client(env.DB).select().from(todos);

	return json({ todos: items });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const env = context.env as Env;
	const formData = await request.formData();

	console.log(request);

	if (request.method === "POST") {
		const title = formData.get("title") as string;

		try {
			await client(env.DB).insert(todos).values({
				title: title,
			});
			return json({ status: 201 });
		} catch (error) {
			console.error("作成に失敗しました。");
			return json({ status: 400, message: "作成に失敗しました。" });
		}
	}

	if (request.method === "DELETE") {
		const id = formData.get("id") as string;

		try {
			await client(env.DB)
				.delete(todos)
				.where(eq(todos.id, parseInt(id)));

			return json({ status: 204 });
		} catch (error) {
			console.error("作成に失敗しました。");
			return json({ status: 400, message: "作成に失敗しました。" });
		}
	}

	return null;
};

export const meta: MetaFunction = () => {
	return [
		{ title: "todo" },
		{ name: "description", content: "Welcome to todo" },
	];
};

export default function Index() {
	const submit = useSubmit();
	const [todo, setTodo] = useState("");
	const { todos } = useLoaderData<typeof loader>();

	return (
		<div className="container">
			<Form
				method="post"
				className="flex items-center gap-1 mb-10"
				onSubmit={(event) => {
					event.preventDefault();
					if (!todo) return;

					submit(event.currentTarget);
					setTodo("");
				}}
			>
				<Input
					name="title"
					value={todo}
					onChange={(e) => {
						setTodo(e.target.value);
					}}
				/>
				<Button variant={"ghost"} size={"icon"}>
					<PlusCircle />
				</Button>
			</Form>
			<div className="flex flex-col gap-2">
				{todos.map((todo) => {
					return (
						<div
							className="flex gap-2 items-center justify-between"
							key={todo.id}
						>
							<div>{todo.title}</div>
							<Form method="delete">
								<input hidden name="id" defaultValue={todo.id} />
								<Button variant={"ghost"} size={"icon"} className="bg-red-600">
									<Trash2 className="text-white" />
								</Button>
							</Form>
						</div>
					);
				})}
			</div>
		</div>
	);
}
