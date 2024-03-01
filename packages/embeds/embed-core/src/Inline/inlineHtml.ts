const html = `<div id="wrapper" style="top:50%; left:50%;transform:translate(-50%,-50%)" class="absolute z-highest">
<div style="transform: translateY(25%) translateX(0);" class="loader bg-white dark:bg-gray-800 relative mx-auto h-screen max-h-[460px] w-full max-w-[760px] rounded-lg border">
	<div class="grid h-screen grid-cols-1 sm:grid-cols-3">
	<div class="h-screen max-h-[460px] border-0 p-4 sm:border-r">
		<div class="h-6 w-6 animate-pulse rounded-full"></div>
		<div class="mt-2">
		<div class="bg-gray-200 inline-block h-4 w-32 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-4 w-20 animate-pulse rounded-md"></div>
		</div>
		<div>
		<div class="bg-gray-200 mt-1 inline-block h-6 w-20 animate-pulse rounded-md"></div>
		</div>
		<div class="mt-4">
		<div class="bg-gray-200 inline-block h-24 w-full animate-pulse rounded-md"></div>
		</div>
		<div class="mt-4">
		<div class="bg-gray-200 inline-block h-4 w-4 animate-pulse rounded-full"></div>
		<div class="bg-gray-200 inline-block h-4 w-20 animate-pulse rounded-md"></div>
		</div>
		<div class="mt-1">
		<div class="bg-gray-200 inline-block h-4 w-4 animate-pulse rounded-full"></div>
		<div class="bg-gray-200 inline-block h-4 w-24 animate-pulse rounded-md"></div>
		</div>
		<div class="mt-1">
		<div class="bg-gray-200 inline-block h-4 w-4 animate-pulse rounded-full"></div>
		<div class="bg-gray-200 inline-block h-4 w-12 animate-pulse rounded-md"></div>
		</div>
	</div>

	<div class="col-span-2 px-10 pt-4">
		<div class="mt-2">
		<div class="bg-gray-200 inline-block h-4 w-12 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-4 w-20 animate-pulse rounded-md"></div>
		</div>

		<div class="text-gray-200 my-4 grid grid-cols-7 gap-4 text-xs font-medium uppercase tracking-widest text-gray-600">
		<div class="bg-gray-200 inline-block h-4 w-full animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-4 w-full animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-4 w-full animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-4 w-full animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-4 w-full animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-4 w-full animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-4 w-full animate-pulse rounded-md"></div>
		</div>
		<div class="grid grid-cols-7 gap-4">
		<div class="inline-block h-10 w-10 animate-pulse rounded-md bg-transparent"></div>
		<div class="inline-block h-10 w-10 animate-pulse rounded-md bg-transparent"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md opacity-30"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md opacity-30"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md opacity-30"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md opacity-30"></div>
		<div class="bg-gray-200 inline-block h-10 w-10 animate-pulse rounded-md opacity-30"></div>
		</div>
	</div>
</div>
</div>
<div id="error" style="transform:translate(-50%,-50%)" class="hidden">
Something went wrong.
</div>
</div>
<slot></slot>`;
export default html;
