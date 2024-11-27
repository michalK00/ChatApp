import { Component } from "@angular/core";

@Component({
  selector: "app-loading-bubbles",
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col gap-2">
      <div class="bg-gray-500 rounded-e-xl rounded-es-xl p-4 w-full max-w-[320px] mr-auto">
        <div class="animate-pulse flex space-x-4">
          <div class="flex-1 space-y-6 py-1">
            <div class="h-2 bg-white rounded w-1/4"></div>
            <div class="space-y-2">
              <div class="grid grid-cols-3 gap-4">
                <div class="h-2 bg-white rounded col-span-2"></div>
                <div class="h-2 bg-white rounded col-span-1"></div>
              </div>
              <div class="h-2 bg-white rounded"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-500 rounded-e-xl rounded-es-xl p-4 w-full max-w-[320px] mr-auto my-2">
        <div class="animate-pulse animate-delay-300 flex space-x-4">
          <div class="flex-1 space-y-6 py-1">
            <div class="h-2 bg-white rounded w-1/4"></div>
            <div class="space-y-2">
              <div class="grid grid-cols-3 gap-4">
                <div class="h-2 bg-white rounded col-span-2"></div>
                <div class="h-2 bg-white rounded col-span-1"></div>
              </div>
              <div class="h-2 bg-white rounded"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-200 rounded-s-xl rounded-ee-xl p-4 w-full max-w-[320px] ml-auto">
        <div class="animate-pulse animate-delay-600 flex space-x-4">
          <div class="flex-1 space-y-6 py-1">
            <div class="h-2 bg-gray-500 rounded w-1/4"></div>
            <div class="space-y-2">
              <div class="grid grid-cols-3 gap-4">
                <div class="h-2 bg-gray-500 rounded col-span-2"></div>
                <div class="h-2 bg-gray-500 rounded col-span-1"></div>
              </div>
              <div class="h-2 bg-gray-500 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-500 rounded-e-xl rounded-es-xl p-4 w-full max-w-[320px] mr-auto my-2">
        <div class="animate-pulse animate-delay-900 flex space-x-4">
          <div class="flex-1 space-y-6 py-1">
            <div class="h-2 bg-white rounded w-1/4"></div>
            <div class="space-y-2">
              <div class="grid grid-cols-3 gap-4">
                <div class="h-2 bg-white rounded col-span-2"></div>
                <div class="h-2 bg-white rounded col-span-1"></div>
              </div>
              <div class="h-2 bg-white rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class LoadingBubblesComponent {}
