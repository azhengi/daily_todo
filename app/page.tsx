"use client"
import Image from 'next/image';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useDrop, useDrag } from 'ahooks';
import { useRequestList, useRequestTags } from './hooks';


interface ItemShape {
    id: number;
    title: string;
    content: string;
    tags: Array<string>;
}

interface ITodoCard extends ItemShape {
    handleDragging: Function
};

const TodoCard: React.FC<ITodoCard> = ({ id, title, content, tags, handleDragging }) => {
    const dragRef = useRef(null);

    useDrag(id, dragRef, {
        onDragStart: () => {
            handleDragging(true);
        },
        onDragEnd: () => {
            handleDragging(false);
        },
    });


    return (
        <div
            className="flex flex-col max-w-md bg-white py-5 px-5 gap-y-2 rounded-lg shadow-sm"
            ref={dragRef}
        >
            <div className="font-bold text-xl">
                {title}
            </div>
            <div className="text-gray-500 line-clamp-2 focus:line-clamp-none cursor-pointer" tabIndex={-1}>
                {content}
            </div>
            <div className="flex gap-3">
                {
                    tags.map((item, index) =>
                        <span key={`${index}-${item}`} className="inline-flex text-rose-500 text-xs rounded-xl bg-red-50 py-1.5 px-2">
                            {item}
                        </span>
                    )
                }
            </div>
        </div>
    );
};


const CreateItemCard: React.FC<Partial<ItemShape> & {
    handleChange: unknown
}> = (props) => {
    const { title, content, tags, handleChange } = props;
    const INIT_TAGS = useRequestTags();


    return (
        <div className="bg-white py-10 px-10 flex flex-col gap-y-3">
            <div className="h-11 border border-gray-300 px-3.5 rounded-md">
                <input
                    name="title"
                    className="h-full w-full border-0 outline-0 text-sm text-gray-400"
                    placeholder="Take dog out on walk"
                    value={title as string}
                    onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
                />
            </div>
            <div className="h-16 border border-gray-300 px-3.5 py-3.5 rounded-md">
                <textarea
                    name="content"
                    className="h-full w-full outline-0 text-sm text-gray-400"
                    value={content as string}
                    onInput={handleChange as React.FormEventHandler<HTMLTextAreaElement>}
                />
            </div>
            <div className="h-11 border border-gray-300 px-3.5 rounded-md ">
                <input
                    name="tags"
                    className="h-full w-full border-0 outline-0 text-sm text-gray-400"
                    placeholder="Tags"
                    value={tags?.join(",")}
                // onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
                />
            </div>
            <div className="flex gap-3">
                {
                    INIT_TAGS.map((item, index) => (
                        <span
                            key={`${index}-${item}`}
                            className="inline-flex text-gray-500 text-xs rounded py-1.5 px-2 border-gray-300 border cursor-pointer hover:text-gray-700"
                            onClick={handleChange as React.MouseEventHandler}
                        >
                            {item}
                        </span>
                    ))
                }
            </div>
        </div>
    );
};



export default function Home() {
    const INIT_LIST = useRequestList();
    const [todo, setTodo] = useState<Array<ItemShape>>(INIT_LIST);
    const [showCreateCard, setShowCreateCard] = useState<boolean>(false);
    const [editItem, setEditItem] = useState<Partial<ItemShape>>({});
    const [isHovering, setIsHovering] = useState(false);
    const [dragging, setDragging] = useState(false);

    const dropRef = useRef(null);

    useDrop(dropRef, {
        onText: (text, e) => {
        },
        onFiles: (files, e) => {
        },
        onUri: (uri, e) => {
        },
        onDom: (id: number, e) => {
            const index = todo.findIndex((item) => item.id === id);
            if (index != -1) {
                const nextTodo = [...todo];
                nextTodo.splice(index, 1);
                setTodo(() => nextTodo);
                setDragging(() => false);
            }
        },
        onDragEnter: () => setIsHovering(true),
        onDragLeave: () => setIsHovering(false),
    });


    const handleClickCreate = () => {
        setShowCreateCard(() => true);

        setTimeout(() => {
            const body = document.body;
            const html = document.documentElement;
            const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

            window.scroll({
                top: height,
                behavior: 'smooth'
            });
        }, 50);
    };

    const handleClickCancel = () => {
        setShowCreateCard(() => false);
    };

    const handleFormChange = useCallback((event: unknown) => {
        const key = (event as React.BaseSyntheticEvent).target.name;
        const eventType = (event as React.BaseSyntheticEvent).type;
        const nextItem = JSON.parse(JSON.stringify(editItem));
        if (eventType === "click") {
            const text = (event as React.BaseSyntheticEvent).target.innerText;
            const tagSlice = nextItem["tags"] || [];
            const index = tagSlice.indexOf(text);
            if (index != -1) {
                tagSlice.splice(index, 1);
            } else {
                tagSlice.push(text);
            }

            nextItem["tags"] = tagSlice;
        } else {
            nextItem[key] = (event as React.BaseSyntheticEvent).target.value;
        }
        setEditItem(() => Object.assign(nextItem, { id: nextItem.id || Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) }));
    }, [editItem]);


    const handleOk = () => {
        if (!showCreateCard) return;

        const nextTodo = [...todo, editItem];
        setTodo(() => nextTodo as Array<ItemShape>);
        setEditItem(() => ({}));
        setShowCreateCard(() => false);
    };

    const handleDragging = (drag: boolean) => {
        setDragging(() => drag);
    };


    return (
        <main className="bg-gray-50 flex justify-center h-screen py-10">
            <div className="">
                <div className="font-bold text-7xl text-gray-200 text-center mb-10">
                    Daily Todo
                </div>

                <div>
                    <div className="flex flex-col gap-y-5 padd pb-56">
                        {
                            todo.map((item, index) => (
                                <TodoCard key={`${index}-${item.title}`} {...item} handleDragging={handleDragging} />
                            ))
                        }

                        {
                            showCreateCard ? (
                                <CreateItemCard {...editItem} handleChange={handleFormChange} />
                            ) : <></>
                        }
                    </div>

                    <div
                        style={{
                            background: "linear-gradient(180deg, rgba(249, 250, 251, 0.00) 0%, #F9FAFB 47.81%)"
                        }}
                        className="fixed flex bottom-0 left-0 items-center justify-center justify-cneter  h-56 w-full"
                    >
                        {
                            showCreateCard ? (
                                <div className="text-gray-500 flex gap-x-5">
                                    <div className="cursor-pointer hover:text-cyan-500" onClick={handleClickCancel}>
                                        Cancel
                                    </div>
                                    <div className="cursor-pointer hover:text-cyan-500" onClick={handleOk}>
                                        OK
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="cursor-pointer" onClick={handleClickCreate}>
                                        <Image
                                            src="/icon_add.svg"
                                            width={38}
                                            height={38}
                                            alt="icon_add"
                                        />
                                    </div>

                                </>
                            )
                        }
                    </div>
                </div>

                <div className={`${dragging ? "flex" : "hidden"} fixed right-10 bottom-2/4 translate-y-[50%]`} ref={dropRef}>
                    <Image src="/icon_delete.svg" width={142} height={165} alt="icon_delete" />
                </div>

            </div>
        </main>
    )
}
